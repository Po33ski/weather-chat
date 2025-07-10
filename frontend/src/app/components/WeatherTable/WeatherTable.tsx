"use client";
import React from 'react';

interface WeatherDayData {
  description: string;
  datetime: string;
  temp: number;
  tempmax: number;
  tempmin: number;
  winddir: string;
  windspeed: number;
  conditions: string;
  sunrise: string;
  sunset: string;
  pressure?: number;
  humidity?: number;
}

interface WeatherTableProps {
  data: WeatherDayData[];
  title: string;
  description: string;
  location: string;
  period: 'forecast' | 'history';
}

export const WeatherTable: React.FC<WeatherTableProps> = ({
  data,
  title,
  description,
  location,
  period
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="text-center text-gray-500">
          <p>No weather data available</p>
        </div>
      </div>
    );
  }

  const formatTemperature = (temp: number) => {
    return `${temp.toFixed(1)}°C`;
  };

  const formatWindSpeed = (speed: number) => {
    return `${speed.toFixed(1)} km/h`;
  };

  const getWeatherIcon = (conditions: string) => {
    const condition = conditions.toLowerCase();
    if (condition.includes('sunny') || condition.includes('clear')) {
      return '☀️';
    } else if (condition.includes('cloudy')) {
      return '☁️';
    } else if (condition.includes('rainy') || condition.includes('rain')) {
      return '🌧️';
    } else if (condition.includes('snowy') || condition.includes('snow')) {
      return '❄️';
    } else if (condition.includes('partly')) {
      return '⛅';
    } else {
      return '🌤️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
            <p className="text-sm text-gray-500 mt-1">
              {location} • {period === 'forecast' ? 'Forecast' : 'Historical'} Data
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">
              {data.length} day{data.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conditions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temperature
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wind
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Humidity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sunrise/Sunset
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((day, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {day.datetime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getWeatherIcon(day.conditions)}</span>
                    <span>{day.conditions}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-medium">{formatTemperature(day.temp)}</span>
                    <span className="text-xs text-gray-500">
                      {formatTemperature(day.tempmin)} - {formatTemperature(day.tempmax)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span>{formatWindSpeed(day.windspeed)}</span>
                    <span className="text-xs text-gray-500">{day.winddir}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {day.humidity ? `${day.humidity}%` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col text-xs">
                    <span>🌅 {day.sunrise}</span>
                    <span>🌇 {day.sunset}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Weather data provided by Visual Crossing</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}; 