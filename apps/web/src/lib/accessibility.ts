/**
 * Accessibility Utilities
 * 
 * Provides accessibility helpers for the CRM web app.
 */

/**
 * Announce a message to screen readers using an ARIA live region.
 */
export function announce(message: string): void {
  if (typeof window === "undefined") return;
  
  let liveRegion = document.getElementById('aria-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    document.body.appendChild(liveRegion);
  }
  
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
}

/**
 * Programmatically focus an HTML element.
 */
export function focusElement(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    element.focus();
  }
}

/**
 * Traps focus within a specified container element.
 * Useful for modals, dialogs, or other temporary UI overlays.
 */
export function trapFocus(containerElement: HTMLElement | null): () => void {
  if (!containerElement || typeof window === "undefined") {
    return () => {};
  }

  const focusableElements = Array.from(
    containerElement.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => (el as HTMLElement).offsetWidth > 0 && (el as HTMLElement).offsetHeight > 0) as HTMLElement[];

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (!firstFocusable) {
    return () => {};
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          event.preventDefault();
        }
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  setTimeout(() => firstFocusable.focus(), 0);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Adds a skip-link to the document body.
 */
export function addSkipLink(targetId: string, linkText: string = 'Skip to main content'): void {
  if (typeof window === "undefined") return;
  
  if (!document.getElementById('skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.id = 'skip-link';
    skipLink.href = `#${targetId}`;
    skipLink.textContent = linkText;
    skipLink.className = 'sr-only focus:not-sr-only';
    skipLink.style.cssText = `
      position: absolute;
      left: -9999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
      z-index: 9999;
      background-color: #fff;
      color: #000;
      padding: 8px;
      border: 1px solid #000;
    `;
    skipLink.onfocus = () => {
      skipLink.style.left = '0';
      skipLink.style.top = '0';
      skipLink.style.width = 'auto';
      skipLink.style.height = 'auto';
    };
    skipLink.onblur = () => {
      skipLink.style.left = '-9999px';
      skipLink.style.top = 'auto';
      skipLink.style.width = '1px';
      skipLink.style.height = '1px';
    };
    document.body.prepend(skipLink);
  }
}
