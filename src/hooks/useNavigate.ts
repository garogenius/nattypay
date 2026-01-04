import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

type NavigationType = "push" | "replace";

const useNavigate = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (isNavigatingRef.current) {
      NProgress.done();
      isNavigatingRef.current = false;
    }
  }, [pathname]);

  const navigate = useCallback(
    (url: string | number, type: NavigationType = "push") => {
      // Ensure router is initialized before using it
      if (typeof window === "undefined" || !router) {
        return;
      }

      // Handle browser back navigation
      if (typeof url === "number") {
        if (url === -1) {
          try {
            router.back();
          } catch (error) {
            // Router not initialized, use window.history as fallback
            window.history.back();
          }
        }
        return;
      }

      // Handle string URLs
      if (!isNavigatingRef.current) {
        isNavigatingRef.current = true;
        NProgress.start();
      }

      try {
        if (type === "replace") {
          router.replace(url);
        } else {
          router.push(url);
        }
      } catch (error) {
        // Router not initialized, use window.location as fallback
        isNavigatingRef.current = false;
        NProgress.done();
        if (type === "replace") {
          window.location.replace(url);
        } else {
          window.location.href = url;
        }
      }
    },
    [router]
  );

  return navigate;
};

export default useNavigate;
