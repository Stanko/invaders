/// <reference types="vite/client" />

declare module 'clipper2-wasm/dist/umd/clipper2z' {
  import type { Clipper2ZFactoryFunction } from 'clipper2-wasm/dist/clipper2z';
  const Clipper2ZFactory: Clipper2ZFactoryFunction;
  export default Clipper2ZFactory;
}

declare const COMMIT_HASH: string;
