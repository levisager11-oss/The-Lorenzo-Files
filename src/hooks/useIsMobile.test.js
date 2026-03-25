import { renderHook, act } from '@testing-library/react';
import useIsMobile from './useIsMobile';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('useIsMobile', () => {
    // Save original window properties
    const originalInnerWidth = window.innerWidth;
    const originalUserAgent = navigator.userAgent;

    beforeEach(() => {
        // Clear all mocks
        vi.clearAllMocks();

        // Mock addEventListener and removeEventListener
        vi.spyOn(window, 'addEventListener');
        vi.spyOn(window, 'removeEventListener');

        // Reset properties
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            configurable: true,
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        });
    });

    afterEach(() => {
        // Restore original properties
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalInnerWidth,
        });

        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            configurable: true,
            value: originalUserAgent,
        });

        // Restore all mocks
        vi.restoreAllMocks();
    });

    const setWindowWidth = (width) => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
        });
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
    };

    const setUserAgent = (userAgent) => {
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            configurable: true,
            value: userAgent,
        });
    };

    it('should return false for desktop width and user agent', () => {
        setWindowWidth(1024);
        setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('should return true for narrow width (< 768px)', () => {
        setWindowWidth(500);
        setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('should return true for mobile user agent even with wide screen', () => {
        setWindowWidth(1024);
        setUserAgent('Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36');

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('should return true for various mobile user agents', () => {
        setWindowWidth(1024);

        const mobileUserAgents = [
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1', // iPhone
            'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1', // iPad
            'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36', // Android
            'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.346 Mobile Safari/534.11+', // BlackBerry
        ];

        mobileUserAgents.forEach(ua => {
            setUserAgent(ua);
            const { result } = renderHook(() => useIsMobile());
            expect(result.current).toBe(true);
        });
    });

    it('should update value when window resizes', () => {
        setWindowWidth(1024);
        setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const { result } = renderHook(() => useIsMobile());

        // Initial state
        expect(result.current).toBe(false);

        // Resize to narrow
        act(() => {
            setWindowWidth(500);
        });

        expect(result.current).toBe(true);

        // Resize back to wide
        act(() => {
            setWindowWidth(1024);
        });

        expect(result.current).toBe(false);
    });

    it('should add and remove resize event listener', () => {
        const { unmount } = renderHook(() => useIsMobile());

        expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

        unmount();

        expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
});
