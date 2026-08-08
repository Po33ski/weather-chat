import { describe, expect, it } from 'vitest';
import { parseAiMessage } from './parseAiMessage';

const CURRENT = {
  temp: 21.5,
  tempmax: 25,
  tempmin: 15,
  windspeed: 10,
  winddir: 180,
  pressure: 1013,
  humidity: 60,
  sunrise: '05:30',
  sunset: '20:15',
  conditions: 'Clear',
};

const DAY = { ...CURRENT, datetime: '2026-08-08' };

const HOTEL = {
  name: 'Hotel Bristol',
  price_per_night: '450',
  currency: 'PLN',
  availability: 'available',
  rating: 8.9,
  reviews_count: 1200,
  highlights: ['spa'],
  url: 'https://www.booking.com/hotel/pl/bristol.html',
};

function fence(type: string, payload: unknown): string {
  return `\`\`\`${type}\n${JSON.stringify(payload)}\n\`\`\``;
}

describe('parseAiMessage', () => {
  it('parses a weather-json current payload', () => {
    const text = fence('weather-json', {
      meta: { city: 'Warsaw', kind: 'current', date: '2026-08-08', language: 'en' },
      current: CURRENT,
    });
    const result = parseAiMessage(text);
    expect(result.metaData).toMatchObject({ city: 'Warsaw', kind: 'current' });
    expect(result.aiChatData?.current).toMatchObject({ temp: 21.5, conditions: 'Clear' });
  });

  it('parses a weather-json forecast payload into days', () => {
    const text = fence('weather-json', {
      meta: { city: 'Warsaw', kind: 'forecast', date_range: '2026-08-08..2026-08-10', language: 'en' },
      days: [DAY],
    });
    const result = parseAiMessage(text);
    expect(result.aiChatData?.days).toHaveLength(1);
    expect(result.aiChatData?.days?.[0]).toMatchObject({ datetime: '2026-08-08', temp: 21.5 });
  });

  it('parses a hotel-json payload', () => {
    const text = fence('hotel-json', {
      meta: { city: 'Warsaw', kind: 'hotels', language: 'en' },
      hotels: [HOTEL],
    });
    const result = parseAiMessage(text);
    expect(result.aiChatData?.hotels).toHaveLength(1);
    expect(result.aiChatData?.hotels?.[0]).toMatchObject({ name: 'Hotel Bristol', rating: 8.9 });
  });

  it('parses a combined-json payload with weather and hotels', () => {
    const text = fence('combined-json', {
      meta: { city: 'Warsaw', kind: 'combined', date: '2026-08-08', language: 'en' },
      weather: { kind: 'current', current: CURRENT },
      hotels: [HOTEL],
    });
    const result = parseAiMessage(text);
    expect(result.aiChatData?.weatherKind).toBe('current');
    expect(result.aiChatData?.current).toMatchObject({ temp: 21.5 });
    expect(result.aiChatData?.hotels).toHaveLength(1);
  });

  it('keeps human text and strips the fence from it', () => {
    const text = 'Here is the weather:\n' + fence('weather-json', {
      meta: { city: 'Warsaw', kind: 'current', date: '2026-08-08', language: 'en' },
      current: CURRENT,
    });
    const result = parseAiMessage(text);
    expect(result.humanText).toBe('Here is the weather:');
  });

  it('falls back gracefully on malformed JSON inside a fence', () => {
    const result = parseAiMessage('```weather-json\n{broken json\n```');
    expect(result.metaData).toBeNull();
    expect(result.aiChatData).toBeNull();
  });

  it('returns plain text untouched when there is no fence', () => {
    const result = parseAiMessage('  Just a friendly answer.  ');
    expect(result).toEqual({
      humanText: 'Just a friendly answer.',
      metaData: null,
      aiChatData: null,
    });
  });

  it('fills missing hotel fields with safe defaults', () => {
    const text = fence('hotel-json', {
      meta: { city: 'Warsaw', kind: 'hotels', language: 'en' },
      hotels: [{ name: 'Bare Hotel' }],
    });
    const hotel = parseAiMessage(text).aiChatData?.hotels?.[0];
    expect(hotel).toEqual({
      name: 'Bare Hotel',
      price_per_night: '',
      currency: '',
      availability: 'unknown',
      rating: null,
      reviews_count: null,
      highlights: [],
      url: '',
    });
  });

  it('handles empty input', () => {
    expect(parseAiMessage('')).toEqual({ humanText: '', metaData: null, aiChatData: null });
  });
});
