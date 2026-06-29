declare module "vite-plus/test" {
  export const describe: (name: string, run: () => void | Promise<void>) => void;
  export const it: (name: string, run: () => void | Promise<void>) => void;
  export const expect: (value: unknown) => {
    toContain: (expected: unknown) => void;
    toMatch: (expected: RegExp) => void;
    toBe: (expected: unknown) => void;
  };
}
