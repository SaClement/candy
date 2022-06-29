// 判断是否需要更新组件
export function shouldUpdateComponent(prevVNode, nextVNode) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;

  if (prevProps === nextProps) {
    return false
  }

  // 如果没有props没有什么变化的时候
  if (!prevProps) {
    return !!nextProps;
  }
  // 如果没有新的props,不会更新组件
  if(!nextProps) {
    return true;
  }

  return hasPropsChanged(prevProps, nextProps);
}

function hasPropsChanged(prevProps, nextProps): boolean {
  // 遍历每个prop.key
  const nextKeys = Object.keys(nextProps);
  const prevKeys = Object.keys(prevProps);
  if (nextKeys.length !== prevKeys.length) {
    // 旧节点和新节点的长度不同，说明有改变返回true
    return true;
  }
  for (let i = 0; i<nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}