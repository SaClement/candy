import { createVNode } from "./vnode"

export function createAppAPI( render ) {
  return function createApp(rootComponent) {
    const app = {
      _component: rootComponent,
      mount(rootContainer) {
        // 基于根组件创建 vnode
        const vnode = createVNode(rootComponent);
        // 调用render函数，基于vnode进行拆分
        render(vnode, rootContainer);
      }
    }
    return app;
  }
}