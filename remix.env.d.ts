/// <reference types="@remix-run/dev" />
/// <reference types="vite/client" />

interface Window {
  ENV: {
    [key: string]: string;
  };
}
