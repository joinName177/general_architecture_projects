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

// Lexical checks paste events with `instanceof ClipboardEvent`.
if (typeof ClipboardEvent === "undefined") {
  class MockClipboardEvent extends Event {
    public readonly clipboardData: DataTransfer | null;

    public constructor(type: string, init: ClipboardEventInit = {}) {
      super(type, init);
      this.clipboardData = init.clipboardData ?? null;
    }
  }

  Object.defineProperty(globalThis, "ClipboardEvent", {
    configurable: true,
    value: MockClipboardEvent,
  });
}

// Lexical measures the DOM range that represents the current selection.
if (!Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () =>
    document.body.getBoundingClientRect();
}
