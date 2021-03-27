export function assertNever(data: never): never {
  throw new Error(`assertNever: ${String(data)}`);
}
