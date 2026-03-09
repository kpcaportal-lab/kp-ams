import { useRouter } from 'next/navigation';

/**
 * Hook that provides a React Router-like navigate function.
 * Simplifies migration from React Router to Next.js
 */
export function useNavigate() {
  const router = useRouter();

  return (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };
}

export default useNavigate;
