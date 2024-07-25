const hideableElements = Array.from(document.getElementsByClassName("menu-hideable"));
hideableElements.forEach(element => {
    hideElement(element);
});

function hideElement(elmnt) {
  const hideButton = Array.from(elmnt.getElementsByClassName("hideable-element-toggle"))[0];
  hideButton.onmousedown = toggleVisble;

  function toggleVisble(e){
    const hideableArea = Array.from(elmnt.getElementsByClassName("menu-hideable-area"))[0];
    const hideButton = Array.from(elmnt.getElementsByClassName("hideable-element-toggle"))[0].getElementsByTagName('img')[0];
    console.log(hideableArea.style.display);
    if (hideableArea.style.display == "none"){
        hideableArea.style.setProperty("display","block");
        if (hideButton.src == "icons/ui/notvisible.png")
          hideButton.src = "icons/ui/visible.png";
        else
          hideButton.src = "icons/ui/arrow-down.png";
    }        
    else {
        hideableArea.style.setProperty("display","none");
        if (hideButton.src == "icons/ui/visible.png")
          hideButton.src = "icons/ui/notvisible.png";
        else
          hideButton.src = "icons/ui/arrow-right.png";
    }
  }
}