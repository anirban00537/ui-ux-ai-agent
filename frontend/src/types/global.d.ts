export {};

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetIdOrAction: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}
