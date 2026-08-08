import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

const KEY = 'test-key';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns the default value when the key is absent', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'fallback'));
    expect(result.current.data).toBe('fallback');
  });

  it('reads a pre-seeded value from localStorage', () => {
    window.localStorage.setItem(KEY, JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage(KEY, 'fallback'));
    expect(result.current.data).toBe('stored');
  });

  it('setter updates state and persists the JSON-stringified value', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, null));
    act(() => {
      result.current.setToLocalStorage('metric');
    });
    expect(result.current.data).toBe('metric');
    expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify('metric'));
  });

  it('supports the functional updater form', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'a'));
    act(() => {
      result.current.setToLocalStorage((prev: string | null) => prev + 'b');
    });
    expect(result.current.data).toBe('ab');
    expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify('ab'));
  });

  it('falls back to the default when stored JSON is corrupt', () => {
    window.localStorage.setItem(KEY, '{not valid json');
    const { result } = renderHook(() => useLocalStorage(KEY, 'fallback'));
    expect(result.current.data).toBe('fallback');
  });

  it('syncs state when a storage event for the same key fires', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, null));
    act(() => {
      window.localStorage.setItem(KEY, JSON.stringify('from-other-tab'));
      window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
    });
    expect(result.current.data).toBe('from-other-tab');
  });

  it('ignores storage events for other keys', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'mine'));
    act(() => {
      window.localStorage.setItem('other-key', JSON.stringify('other'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'other-key' }));
    });
    expect(result.current.data).toBe('mine');
  });
});
