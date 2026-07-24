import { useEffect, useMemo } from "react";

import { LifecycleScope } from "~/shared/lifecycle/lifecycle-scope";

export function useLifecycleScope(): LifecycleScope {
  const lifecycleScope = useMemo(() => new LifecycleScope(), []);

  useEffect(
    () => () => {
      lifecycleScope.dispose();
    },
    [lifecycleScope],
  );

  return lifecycleScope;
}
