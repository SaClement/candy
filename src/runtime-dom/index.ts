// 操作真实DOM树
function createElement(type) {
  console.log("CreateElement", type);
  const element = document.createElement(type);
  return element;
}

function setElementText(el, text) {
  console.log("SetElementText", el, text);
  el.textContent = text;
}