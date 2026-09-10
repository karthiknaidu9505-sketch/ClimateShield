import { OpenMeteoResponse } from '../../types/index.js';

export class OpenMeteoClient {
  private static readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';
  private static readonly TIMEOUT_MS = 8000;

  /**
   * Fetches real-time weather and forecast observations from Open-Meteo for given coordinates.
   * Handles timeouts, HTTP errors, and malformed responses.
   */
  public static async getForecast(latitude: number, longitude: number): Promise<OpenMeteoResponse> {
    // 1. Validate coordinate inputs
    if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}. Must be a float between -90.0 and 90.0`);
    }
    if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}. Must be a float between -180.0 and 180.0`);
    }

    // 2. Build Open-Meteo REST query URL
    const url = new URL(this.BASE_URL);
    url.searchParams.set('latitude', latitude.toFixed(4));
    url.searchParams.set('longitude', longitude.toFixed(4));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m'
    );
    url.searchParams.set('hourly', 'precipitation,rain');
    url.searchParams.set('forecast_days', '1');
    url.searchParams.set('timezone', 'auto');

    // 3. Execute HTTP request with AbortSignal timeout
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ClimateShield-WeatherService/1.0'
        },
        signal: AbortSignal.timeout(this.TIMEOUT_MS)
      });
    } catch (fetchErr: any) {
      if (fetchErr.name === 'TimeoutError' || fetchErr.name === 'AbortError') {
        throw new Error(`Open-Meteo API timeout after ${this.TIMEOUT_MS}ms for coordinates (${latitude}, ${longitude})`);
      }
      throw new Error(`Failed to reach Open-Meteo API: ${fetchErr.message}`);
    }

    // 4. Verify HTTP status
    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        // ignore
      }
      throw new Error(`Open-Meteo returned HTTP ${response.status}: ${errorBody || response.statusText}`);
    }

    // 5. Parse and validate JSON structure
    let data: any;
    try {
      data = await response.json();
    } catch (parseErr: any) {
      throw new Error(`Malformed JSON response from Open-Meteo: ${parseErr.message}`);
    }

    if (!data || !data.current || typeof data.current.temperature_2m !== 'number') {
      throw new Error('Open-Meteo response missing expected current weather fields');
    }

    return data as OpenMeteoResponse;
  }

  /**
   * Helper to translate WMO Weather interpretation codes (WW) into human-readable condition descriptions.
   */
  public static getWeatherDescription(weatherCode: number): string {
    switch (weatherCode) {
      case 0: return 'Clear Sky';
      case 1: return 'Mainly Clear';
      case 2: return 'Partly Cloudy';
      case 3: return 'Overcast';
      case 45: return 'Fog';
      case 48: return 'Depositing Rime Fog';
      case 51: return 'Light Drizzle';
      case 53: return 'Moderate Drizzle';
      case 55: return 'Dense Drizzle';
      case 61: return 'Slight Rain';
      case 63: return 'Moderate Rain';
      case 65: return 'Heavy Rain';
      case 71: return 'Slight Snow Fall';
      case 80: return 'Slight Rain Showers';
      case 81: return 'Moderate Rain Showers';
      case 82: return 'Violent Rain Showers';
      case 95: return 'Thunderstorm';
      case 96: return 'Thunderstorm with Slight Hail';
      case 99: return 'Thunderstorm with Heavy Hail';
      default: return 'Atmospheric Precipitation';
    }
  }
}
