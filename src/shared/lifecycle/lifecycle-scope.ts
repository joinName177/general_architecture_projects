export class LifecycleScope {
  private readonly activeControllers = new Set<AbortController>();

  public dispose(): void {
    for (const controller of this.activeControllers) controller.abort();
    this.activeControllers.clear();
  }

  public async run<T>(
    operation: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const controller = new AbortController();
    this.activeControllers.add(controller);

    try {
      return await operation(controller.signal);
    } finally {
      this.activeControllers.delete(controller);
    }
  }
}
