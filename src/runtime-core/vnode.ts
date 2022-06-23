import { ShapeFlags } from "../shared"

export { createVNode as createElementVNode }

export function createVNode(
  type: any,
  props?: any,
  children?: string | Array<any> ) {
  
  /**
   * 创建一个虚拟节点
   * 如果传入的type是对象的话，那么就是用户设置的option
   * 如果传入的是string
   * createVNode("div")
   * 如果为对象的时候
   * createVNode(App)
   * */ 
  const vnode = {
    el: null,
    component: null,
    key: props?.key,
    type,
    props: props || {},
    children,
    shapeFlag: getShapeFlag(type)
  }

  if(Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children == 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }

  normalizeChildren(vnode, children);

  return vnode
}

export function normalizeChildren (vnode, children) {
  if(typeof children === "object") {
    if(vnode.shapeFlag & ShapeFlags.ELEMENT){
      
    }else {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    }
  }
}

export const Text = Symbol('Text');
export const Fragment = Symbol('Fragment');

export function createTextVNode(text: string = " ") {
  return createVNode(Text, {}, text)
}

// 处理标准化的vnode格式
export function normalizeVNode(child) {
  // 暂时只处理children为number和string的情况
  if(typeof child === "string" || typeof child === "number" ) {
    return createVNode(Text, null, String(child));
  } else {
    return child;
  }
}

function getShapeFlag(type: any) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}