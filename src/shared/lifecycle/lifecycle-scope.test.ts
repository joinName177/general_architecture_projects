import { describe, expect, it, vi } from "vitest";

import { LifecycleScope } from "~/shared/lifecycle/lifecycle-scope";

describe("LifecycleScope", () => {
  it("should abort active work when the scope is disposed", () => {
    const scope = new LifecycleScope();
    let operationSignal: AbortSignal | undefined;
    const operation = scope.run((signal) => {
      operationSignal = signal;
      return new Promise<void>(() => undefined);
    });

    scope.dispose();

    expect(operationSignal?.aborted).toBe(true);
    void operation;
  });

  it("should not abort completed work when the scope is disposed", async () => {
    const handleAbort = vi.fn();
    const scope = new LifecycleScope();

    await scope.run((signal) => {
      signal.addEventListener("abort", handleAbort);
      return Promise.resolve();
    });
    scope.dispose();

    expect(handleAbort).not.toHaveBeenCalled();
  });
});
