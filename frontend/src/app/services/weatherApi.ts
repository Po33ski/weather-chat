const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
import { ApiResponse, ChatApiResponse, WeatherData } from '../types/interfaces';

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

  async getChatResponse(
    message: string,
    conversationHistory: Array<{ text: string; sender: string; unitSystem?: string; userId?: string }>,
    sessionId?: string,
    unitSystem?: string,
    userId?: string
  ): Promise<ChatApiResponse> {
    return this.makeRequest<{ message: string; sender: string }>('/api/chat', 'POST', {
      message,
      conversation_history: conversationHistory,
      session_id: sessionId,
      unit_system: unitSystem,
      user_id: userId
    });
  }
}

export const weatherApi = new WeatherApiService();