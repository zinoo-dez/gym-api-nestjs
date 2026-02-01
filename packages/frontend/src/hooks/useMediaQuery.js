/**
 * useMediaQuery Hook
 * Custom hook for responsive design and media query detection
 * Supports orientation detection and breakpoint matching
 */

import { useState, useEffect } from "react";

/**
 * Hook to detect if a media query matches
 * @param {string} query - Media query string (e.g., "(min-width: 768px)")
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Update state when media query changes
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to detect screen orientation
 * @returns {Object} - Object with orientation info
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState(() => {
    if (typeof window !== "undefined") {
      return {
        isPortrait: window.innerHeight > window.innerWidth,
        isLandscape: window.innerWidth > window.innerHeight,
        angle: window.screen?.orientation?.angle || 0,
        type: window.screen?.orientation?.type || "unknown",
      };
    }
    return {
      isPortrait: true,
      isLandscape: false,
      angle: 0,
      type: "unknown",
    };
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation({
        isPortrait: window.innerHeight > window.innerWidth,
        isLandscape: window.innerWidth > window.innerHeight,
        angle: window.screen?.orientation?.angle || 0,
        type: window.screen?.orientation?.type || "unknown",
      });
    };

    // Listen for orientation changes
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect Tailwind CSS breakpoints
 * @returns {Object} - Object with breakpoint flags
 */
export function useBreakpoint() {
  const isSm = useMediaQuery("(min-width: 640px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const is2Xl = useMediaQuery("(min-width: 1536px)");

  return {
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
  };
}

/**
 * Hook to detect if device supports touch
 * @returns {boolean} - Whether device supports touch
 */
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    }
    return false;
  });

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0,
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}
