declare global {
  const __dirname: string;
  const __filename: string;
  const process: NodeJS.Process;
  const TextEncoder: typeof globalThis.TextEncoder;
  const TextDecoder: typeof globalThis.TextDecoder;
  const fetch: typeof globalThis.fetch;
}
