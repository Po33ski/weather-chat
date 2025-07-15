import { StaticImageData } from "next/image";

export interface PagesInfo {
  current: string;
  forecast: string;
  history: string;
}

export interface MainPhotos {
  current: StaticImageData;
  forecast: StaticImageData;
  history: StaticImageData;
}

export interface MenuOptions {
  optionName: string;
  path: string;
}

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
export interface CurrentData {
  address: string | null;
  currentConditions: {
    temp: number | null;
    humidity: number | null;
    windspeed: number | null;
    winddir: number | null;
    pressure: number | null;
    conditions: string | null;
    sunrise: string | null;
    sunset: string | null;
  };
  days: [CurrentDataDay];
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
export interface FrontendWeatherData {
  address: string | null;
  days: [HistoryAndForecastDay];
}

export interface PostData {
  title: string;
  description: string;
  id: string;
  userId: string;
  username: string;
  uniqueId: string;
}

export interface CreateFormData {
  title: string;
  description: string;
}
export interface dataToSend {
  title: string;
  description: string;
  uniqueId: string;
}

export interface PropsData {
  post: PostData;
  setPostsList: React.Dispatch<React.SetStateAction<PostData[] | null>>;
}

export interface LikeData {
  likeId: string;
  userId: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  unitSystem?: string;
  userId?: string;
}

export interface ChatRequest {
  message: string;
  conversation_history: Array<{
    text: string;
    sender: string;
  }>;
  session_id?: string;
}


export interface ChatApiResponse {
  success: boolean;
  data?: {
    message: string;
    sender: string;
  };
  error?: string;
}

export interface UnitSystemRequest {
  unit_system: string;
  session_id?: string;
  user_id?: string;
}

export interface UnitSystemResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
}

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