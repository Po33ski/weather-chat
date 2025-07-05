const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface WeatherData {
  location: string;
  temperature: number;
  humidity?: number;  // Keep as number (float) to match backend
  wind_speed?: number;
  wind_direction?: string | number;  // Can be string or number
  pressure?: number;
  visibility?: number;
  uv_index?: number;
  conditions?: string;
  icon?: string;
  sunrise?: string;  // Added sunrise field
  sunset?: string;   // Added sunset field
  timestamp: string;
  weather_type: string;
}

export interface CurrentWeatherRequest {
  location: string;
}

export interface ForecastWeatherRequest {
  location: string;
  days: number;
}

export interface HistoryWeatherRequest {
  location: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string;   // YYYY-MM-DD format
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class WeatherApiService {
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getCurrentWeather(location: string): Promise<ApiResponse<WeatherData>> {
    return this.makeRequest<WeatherData>('/api/weather/current', 'POST', {
      location
    });
  }

  async getForecastWeather(location: string, days: number = 7): Promise<ApiResponse<WeatherData[]>> {
    return this.makeRequest<WeatherData[]>('/api/weather/forecast', 'POST', {
      location,
      days
    });
  }

  async getHistoryWeather(location: string, startDate: string, endDate: string): Promise<ApiResponse<WeatherData[]>> {
    return this.makeRequest<WeatherData[]>('/api/weather/history', 'POST', {
      location,
      start_date: startDate,
      end_date: endDate
    });
  }
}

export const weatherApi = new WeatherApiService(); 