import { Request, Response } from 'express';
import { WeatherHydrologyService } from '../services/weather/weatherHydrologyService.js';
import { OpenMeteoClient } from '../services/weather/openMeteoClient.js';
import { LocationService } from '../services/locations/locationService.js';

/**
 * Handles weather data synchronization:
 * GET or POST /api/weather/sync
 *
 * Query / Body parameters:
 *  - locationId (optional): syncs a specific location only
 *  - simulateRainfall (optional): numeric override for operational stress testing
 */
export const syncWeather = async (req: Request, res: Response) => {
  try {
    const locationId = (req.query.locationId as string) || req.body?.locationId;
    const simulateParam = req.query.simulateRainfall || req.body?.simulateRainfall;
    const simulatedRainfall = simulateParam !== undefined ? Number(simulateParam) : undefined;

    const report = await WeatherHydrologyService.syncAllLocations({
      locationId,
      simulatedRainfall
    });

    return res.json(report);
  } catch (error: any) {
    console.error('Error during weather synchronization:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Weather synchronization encountered an unexpected failure.',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Retrieves the latest live weather observation directly from Open-Meteo for a given location:
 * GET /api/weather/latest/:locationId
 */
export const getLatestWeather = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const location = await LocationService.getLocationById(locationId);

    if (!location) {
      return res.status(404).json({ error: `Location '${locationId}' not found.` });
    }

    const forecast = await OpenMeteoClient.getForecast(location.latitude, location.longitude);
    const weatherDesc = OpenMeteoClient.getWeatherDescription(forecast.current.weather_code);

    return res.json({
      success: true,
      locationId: location.id,
      locationName: location.name,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      currentWeather: {
        temperature: forecast.current.temperature_2m,
        humidity: forecast.current.relative_humidity_2m,
        precipitation: forecast.current.precipitation,
        rain: forecast.current.rain,
        windSpeed: forecast.current.wind_speed_10m,
        weatherCode: forecast.current.weather_code,
        condition: weatherDesc,
        observedAt: forecast.current.time
      },
      latestStoredReading: location.latestReading || (location as any).environmental
    });
  } catch (error: any) {
    console.error(`Error retrieving weather for location ${req.params.locationId}:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve live weather data.'
    });
  }
};
