import { BACKEND_API_URL } from '../constants/apiConstants';
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

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const detail = payload?.detail;
        const errorMessage =
          (typeof detail === 'string' ? detail : detail?.error) ||
          payload?.error ||
          `HTTP error! status: ${response.status}`;
        const sessionId = detail?.session_id ?? payload?.session_id;
        return {
          success: false,
          error: errorMessage,
          ...(sessionId ? { session_id: sessionId } : {}),
        };
      }

      return payload ?? { success: false, error: 'Invalid JSON response from server' };
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
    conversationHistory: Array<{ text: string; sender: string }>,
    sessionId?: string
  ): Promise<ChatApiResponse> {
    return this.makeRequest<{ message: string; sender: string }>('/api/chat', 'POST', {
      message,
      conversation_history: conversationHistory,
      session_id: sessionId
    });
  }
}

export const weatherApi = new WeatherApiService();