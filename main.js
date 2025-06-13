function displayOrHideElement(elementName) {
    const element = document.querySelector(elementName);

    if (element) {
        const currentDisplay = window.getComputedStyle(element).display;
        const fragTableButton = document.querySelector(".frag-table-button");

        if (currentDisplay === "block") {
            element.style.display = "none";
            fragTableButton.innerText = "Open Fragment Table"
        }
        else {
            fragTableButton.innerText = "Close Fragment Table"
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
        const fragTableButton = document.querySelector(".frag-table-button");

        if (currentDisplay === "block") {
            element.style.display = "none";
            fragTableButton.innerText = "Open Fragment Table"
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
    // Correctly declare 'element' to keep it within this function's scope
    let element = document.querySelector(elementName);

    // Check if the main element exists
    if (!element) {
        console.error(`Element with selector "${elementName}" not found. Cannot make it draggable.`);
        return;
    }

    // Initialize position variables within the scope of dragElement
    // so they are unique for each draggable element if you call dragElement multiple times
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Determine which element will be the "handle" for dragging
    let dragHandle = element; // Default: the element itself is the handle
    if (elementHeader) { // If an elementHeader selector is provided
        const headerElement = document.querySelector(elementHeader);
        if (headerElement) {
            dragHandle = headerElement; // Use the header as the drag handle
        } else {
            console.warn(`Element header with selector "${elementHeader}" not found. Using main element as drag handle.`);
        }
    }

    // Set initial cursor and touch-action for the draggable element
    element.style.cursor = 'grab';
    element.style.touchAction = 'none'; // Prevents default touch behaviors like scrolling/zooming

    // Attach event listeners to the drag handle
    dragHandle.onmousedown = dragStart;   // For desktop mouse drag
    dragHandle.ontouchstart = dragStart; // For mobile touch drag


    // --- Core Drag Functions ---

    function dragStart(e) {
        e = e || window.event;
        e.preventDefault(); 

        let currentClientX, currentClientY;
        if (e.type === 'touchstart') {
            const touch = e.touches[0];
            currentClientX = touch.clientX;
            currentClientY = touch.clientY;
        } else { 
            currentClientX = e.clientX;
            currentClientY = e.clientY;
        }

        pos3 = currentClientX; 
        pos4 = currentClientY; 

        if (e.type === 'touchstart') {
            document.ontouchend = dragEnd;
            document.ontouchmove = elementDrag;
        } else { // mousedown
            document.onmouseup = dragEnd;
            document.onmousemove = elementDrag;
        }

        element.style.cursor = 'grabbing'; 
    }

    function elementDrag(e) {
        e = e || window.event;

        let currentClientX, currentClientY;
        if (e.type === 'touchmove') {
            e.preventDefault(); 
            const touch = e.touches[0];
            currentClientX = touch.clientX;
            currentClientY = touch.clientY;
        } else { // mousemove
            currentClientX = e.clientX;
            currentClientY = e.clientY;
        }

        pos1 = pos3 - currentClientX;
        pos2 = pos4 - currentClientY;

        pos3 = currentClientX;
        pos4 = currentClientY;

        let newTop = element.offsetTop - pos2;
        let newLeft = element.offsetLeft - pos1;

        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;

        const minX = 0;
        const minY = 0;
        const maxX = viewportWidth - elementWidth;
        const maxY = viewportHeight - elementHeight;

        newLeft = Math.max(minX, Math.min(newLeft, maxX));
        newTop = Math.max(minY, Math.min(newTop, maxY));

        element.style.top = newTop + "px";
        element.style.left = newLeft + "px";
    }

    function dragEnd() {
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }
}


/// Change alert
window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
};

