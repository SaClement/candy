export function isObject(target) {
  return typeof target === "object" && target !== null;
}

export function hasChanged(value, oldValue) {
  return !Object.is(value, oldValue);
}