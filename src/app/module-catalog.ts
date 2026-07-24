export interface ModuleDefinition {
  readonly id: string;
  readonly routeId: string;
  readonly lazy: () => Promise<unknown>;
}

export const moduleCatalog: readonly ModuleDefinition[] = [];
