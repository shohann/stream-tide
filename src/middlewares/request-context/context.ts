import { AsyncLocalStorage } from "async_hooks";

let currentContext: AsyncLocalStorage<Map<string, any>> | undefined;

export function context(): AsyncLocalStorage<Map<string, any>> {
  if (currentContext === undefined) {
    currentContext = new AsyncLocalStorage<Map<string, any>>();
  }

  return currentContext;
}
