/// <reference types="vite/client" />

// Vite client types + custom environment type declarations

interface ImportMetaEnv {
  readonly GITHUB_PAGES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
