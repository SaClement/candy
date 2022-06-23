export const enum ShapeFlags {
  // 要渲染的element类型
  ELEMENT = 1,
  // 组件类型
  STATEFUL_COMPONENT = 1 << 2,
  // vnode的children为string类型
  TEXT_CHILDREN = 1 << 3,
  // vnode的children为array类型
  ARRAY_CHILDREN = 1 << 4,
  // vnode的children为slots类型
  SLOTS_CHILDREN = 1 << 5,
}