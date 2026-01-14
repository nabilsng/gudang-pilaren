export async function withMinDelay<T>(promise: Promise<T>, ms = 600): Promise<T> {
  const [res] = await Promise.all([
    promise,
    new Promise<void>((r) => setTimeout(r, ms)),
  ]);
  return res;
}
