/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VITRINE_URL?: string;
  readonly VITE_VITRINE_FALLBACK?: string;
  readonly VITE_LEADS_URL?: string;
  readonly VITE_GTM_ID?: string;
}

interface Window {
  dataLayer?: Record<string, unknown>[];
}
