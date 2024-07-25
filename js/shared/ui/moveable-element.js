const draggagleElements = Array.from(document.getElementsByClassName("moveable-element"));
draggagleElements.forEach(element => {
    dragElement(element);
});

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const anchor = Array.from(elmnt.getElementsByClassName("moveable-element-anchor"))[0];
  anchor.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    elmnt.style.setProperty("bottom","unset");
    elmnt.style.setProperty("right","unset");
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}