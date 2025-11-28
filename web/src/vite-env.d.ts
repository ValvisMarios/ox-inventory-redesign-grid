/// <reference types="vite/client" />

declare module '*.ogg' {
  const src: string;
  export default src;
}

declare function GetParentResourceName(): string;
