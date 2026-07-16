/** next/navigation shim — inert router for preview cards. */
export function useRouter() {
  return {
    push: (_href?: string) => {},
    replace: (_href?: string) => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: (_href?: string) => {},
  };
}

export function usePathname(): string {
  return "/";
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams();
}

export function notFound(): never {
  throw new Error("notFound() called in preview");
}
