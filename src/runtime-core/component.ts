import { emit } from "./componentEmits"

export function createComponentInstance(vnode, parent) {
  // 实例对象
  const instance = {
    type: vnode.type,
    vnode,
    next: null, //更新的vnode
    props: {},
    parent,
    provides: parent ? parent.provides : {}, // 使父节点的provides作为初始值，
    proxy: null,
    isMounted: false, //是否挂载
    attrs: {}, // 用于存放 attrs 数据
    slots: {}, // 用于存放 插槽 数据
    ctx: {}, // context 对象
    setupState: {}, // 存储 setup 的返回值
    emit: () => {}
  }

  instance.ctx = {
    _: instance,
  }

  instance.emit = emit.bind(null, instance) as any;

  return instance
}

export function setupComponent(instance) {
  
}