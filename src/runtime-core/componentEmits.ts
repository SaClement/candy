import { camelize, toHandlerKey } from "../shared";

export function emit(instance, event: string, ...rawArgs) {
  const props = instance.props;

  // 得到对应的事件的名称
  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  if (handler) {
    handler(...rawArgs);
  }
}