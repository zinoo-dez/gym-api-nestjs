import { useEffect, useRef } from "react";

const isPrimaryClick = (event: MouseEvent): boolean => {
  return event.button === 0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey;
};

export const useUnsavedChangesPrompt = (
  shouldBlockNavigation: boolean,
  message = "You have unsaved changes. Leave without saving?",
) => {
  const skipNextPopStatePromptRef = useRef(false);

  useEffect(() => {
    if (!shouldBlockNavigation) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldBlockNavigation]);

  useEffect(() => {
    if (!shouldBlockNavigation) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !isPrimaryClick(event)) {
        return;
      }

      const elementTarget = event.target;

      if (!(elementTarget instanceof Element)) {
        return;
      }

      const anchor = elementTarget.closest("a");

      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("#")) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(anchor.href, currentUrl.href);

      const isSameDestination =
        nextUrl.origin === currentUrl.origin &&
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search &&
        nextUrl.hash === currentUrl.hash;

      if (isSameDestination) {
        return;
      }

      const confirmed = window.confirm(message);

      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handlePopState = () => {
      if (skipNextPopStatePromptRef.current) {
        skipNextPopStatePromptRef.current = false;
        return;
      }

      const confirmed = window.confirm(message);

      if (confirmed) {
        return;
      }

      skipNextPopStatePromptRef.current = true;
      window.history.go(1);
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
      skipNextPopStatePromptRef.current = false;
    };
  }, [message, shouldBlockNavigation]);
};
