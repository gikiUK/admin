import { useEffect } from "react";

/**
 * Guards against losing edits two ways: the browser's own prompt for
 * reloads/closes, and a confirm on any in-app link click, since the App Router
 * gives us no navigation event to cancel. Captured on the way down so we can
 * stop the click before Next starts routing.
 */
export function useUnsavedChangesWarning(enabled: boolean, message: string) {
  useEffect(() => {
    if (!enabled) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.pathname === window.location.pathname) return;
      // Leaving the app entirely still fires beforeunload, so let that handle it.
      if (destination.origin !== window.location.origin) return;

      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [enabled, message]);
}
