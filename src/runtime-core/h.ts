import { createVNode } from "./vnode";

export function h(type: string, props: any, children: string | Array<any>) {
  return createVNode(type, props, children);
}