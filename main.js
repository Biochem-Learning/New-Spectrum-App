const MOL_CANVAS_WIDTH = 90;
const MOL_CANVAS_HEIGHT = 90;
const SPEC_CANVAS_WIDTH = 95;
const SPEC_CANVAS_HEIGHT = 95;

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
    let element = document.querySelector(elementName);

    if (!element) {
        console.error(`Element with selector "${elementName}" not found. Cannot make it draggable.`);
        return;
    }

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    let dragHandle = element;
    if (elementHeader) { 
        const headerElement = document.querySelector(elementHeader);
        if (headerElement) {
            dragHandle = headerElement; 
        } else {
            console.warn(`Element header with selector "${elementHeader}" not found. Using main element as drag handle.`);
        }
    }

    element.style.cursor = 'grab';
    element.style.touchAction = 'none';

    dragHandle.onmousedown = dragStart;   
    dragHandle.ontouchstart = dragStart;


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
        } else {
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

/// Display molecules and spectral graph

async function getData(url = "") {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - Could not load JDX from URL.`);
    }

    const jdxContentString = await response.text();
    
    return jdxContentString;
}



function percentage(divSelector, percentage, dimension) {
    div = document.querySelector(divSelector);

    if (!div) {
        console.error(`Element with selector "${divSelector}" not found.`);
        return null;
    }

    parent = div.parentNode;
    
    if (!parent) {
        console.error(`Element with selector "${divSelector}" has no parent.`);
        return null;
    }

    parentDimension = (dimension === "width") ? parent.offsetWidth : parent.offsetHeight 
    caculatedDimension = parentDimension * percentage / 100;

    return caculatedDimension
}

async function initializeCanvas(canvas, url="") {
    
}

function createSubmenu(menuFilePath, id) {
    let menuHeader = document.querySelector(".nav-bar");

    let list = document.createElement("ul");
    list.classList.add('submenu');
    list.id = id;

    fetch(menuFilePath)
    .then(response => response.text())
    .then(data => {
        const lines = data.split('\n');
        const itemArray = lines.map(line => line.trim()).filter(line => line !== '');
        
        for(let i = 0; i < itemArray.length; i += 1) {
            let subItem = document.createElement("li");
            subItem.textContent = itemArray[i];
            subItem.id = "menu-item-" + i;
            subItem.classList.add('nav-bar-section');
            list.appendChild(subItem);
        }
    })
    .catch(error => console.error('Error reading file:', error));

    menuHeader.appendChild(list)
}

// createSubmenu("data/Spectra/CompondMenu.txt", "compound-submenu")

// document.querySelector("#menu-item-1").addEventListener("click", function() {
//     displayOrHideElement(".frag-table");
// });
