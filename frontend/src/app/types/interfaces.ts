export interface MetricSystems {
  US: string;
  METRIC: string;
  UK: string;
}

export interface UnitSystems {
  US: { unit: string; temperature: string; distance: string };
  METRIC: { unit: string; temperature: string; distance: string };
  UK: { unit: string; temperature: string; distance: string };
}

export interface BrickModalData {
  data: string | number | null;
  kindOfData: string | null;
  title: string | null;
  desc: string | null;
}

export interface HoursData {
  temp: number | null;
  conditions: string | null;
  winddir: number | null;
  windspeed: number | null;
  pressure: string | null;
  humidity: string | null;
}

export interface CurrentDataDay {
  description: string | null;
  temp: number | null;
  tempmax: number | null;
  tempmin: number | null;
  winddir: number | null;
  windspeed: number | null;
  conditions: string | null;
  sunrise: string | null;
  sunset: string | null;
  pressure: number | null;
  humidity: number | null;
  hours: [HoursData];
}

export interface HistoryAndForecastDay {
  datetime: string | null;
  temp: number | null;
  tempmax: number | null;
  tempmin: number | null;
  winddir: number | null;
  windspeed: number | null;
  conditions: string | null;
  sunrise: string | null;
  sunset: string | null;
  pressure: string | null;
  humidity: string | null;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChatApiResponse extends ApiResponse<{ message: string; sender: string }> {
  session_id?: string;
}
