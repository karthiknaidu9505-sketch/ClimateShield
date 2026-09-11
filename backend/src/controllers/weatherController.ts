import { Response } from 'express';
import { WeatherHydrologyService } from '../services/weather/weatherHydrologyService.js';
import { OpenMeteoClient } from '../services/weather/openMeteoClient.js';
import { LocationService } from '../services/locations/locationService.js';
import { AuthenticatedRequest, isAuthorizedForJurisdiction } from '../middlewares/authMiddleware.js';

/**
 * Handles weather data synchronization:
 * GET or POST /api/weather/sync
 */
export const syncWeather = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const locationId = (req.query.locationId as string) || req.body?.locationId;
    const simulateParam = req.query.simulateRainfall || req.body?.simulateRainfall;
    const simulatedRainfall = simulateParam !== undefined ? Number(simulateParam) : undefined;

    if (locationId) {
      const location = await LocationService.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({ success: false, error: `Location '${locationId}' not found.` });
      }
      if (!isAuthorizedForJurisdiction(req, location.jurisdictionId)) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: You are not authorized to trigger weather sync for location '${locationId}' in another district.`
        });
      }
    }

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
export const getLatestWeather = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const location = await LocationService.getLocationById(locationId);

    if (!location) {
      return res.status(404).json({ success: false, error: `Location '${locationId}' not found.` });
    }

    if (!isAuthorizedForJurisdiction(req, location.jurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You are not authorized to view weather telemetry for location '${locationId}' in another district.`
      });
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
