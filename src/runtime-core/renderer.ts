import { ShapeFlags } from "../shared";
import { Fragment, normalizeVNode, Text } from "./vnode";


export function createRenderer(option) {
  const {
    createElement: 
  }

  const render = (vnode, container) => {
    patch(null, vnode, container);
  }

  function patch(
    n1,
    n2,
    container = null,
    anchor = null,
    parentComponent = null
  ) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Text:
        // processText(n1, n2, container);
        break;
      // 其中还有几个类型比如： static fragment comment
      case Fragment:
        // processFragment(n1, n2, container);
        break;
      default:
        // 这里就基于 shapeFlag 来处理
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理element类型
          // processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理component类型
          // processComponent(n1, n2, container, parentComponent);
        }
    }
  }
}