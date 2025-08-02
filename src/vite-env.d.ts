/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_PADDLE_VENDOR_ID: string
  readonly VITE_PADDLE_ENVIRONMENT: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}