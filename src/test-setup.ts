// Vitest global setup — polyfill browser APIs not available in jsdom.
import { vi } from "vitest";

// HeroUI ScrollShadow relies on ResizeObserver
if (typeof ResizeObserver === "undefined") {
  class MockResizeObserver {
    public disconnect(): void {}
    public observe(): void {}
    public unobserve(): void {}
  }
  globalThis.ResizeObserver = MockResizeObserver;
}

// jsdom does not implement scrollIntoView on HTMLElement
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}
