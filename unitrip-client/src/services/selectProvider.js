import { providerConfig } from "./providerConfig";
import { httpProvider } from "./httpProvider";

export function selectProvider(serviceName, mockProvider) {
  return providerConfig[serviceName] === "http" ? httpProvider(serviceName) : mockProvider;
}
