'use client';

/**
 * Utility to send custom events to Google Analytics
 * @param action The event name (e.g., 'button_click')
 * @param category The category (e.g., 'engagement')
 * @param label The label (e.g., 'hero_cta_login')
 * @param value Optional numeric value
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
