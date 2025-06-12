function displayOrHideElement(elementName) {
    const element = document.querySelector(elementName);

    if (element) {
        const currentDisplay = window.getComputedStyle(element).display;

        if (currentDisplay === "block") {
            element.style.display = "none";
        }
        else {
            element.style.display = "block";
        }
    } else {
        console.warn(`Element with selector "${elementName}" not found.`);
    }
}

function clickout(elementName) {
    const element = document.querySelector(elementName);

    if (element) {
        const currentDisplay = window.getComputedStyle(element).display;

        if (currentDisplay === "block") {
            element.style.display = "none";
        }
    } else {
        console.warn(`Element with selector "${elementName}" not found.`);
    }
}

document.querySelector(".frag-table-button").addEventListener("click", function() {
    event.stopPropagation()
    displayOrHideElement(".frag-table");
});

document.addEventListener("click", function() {
    const clickedElement = event.target

    if (clickedElement.className !== "frag-table" && clickedElement.className !== "f-t-general-instr") {
        clickout(".frag-table");
    }
});

///drag
dragElement(".frag-table", ".f-t-general-instr");

function dragElement(elementName, elementHeader) {
    
    element = document.querySelector(elementName);

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.querySelector(elementHeader)) {
        // if present, the header is where you move the DIV from:
        document.querySelector(elementHeader).onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


/// Change alert
window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
};