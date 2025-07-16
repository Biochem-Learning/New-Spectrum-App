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

async function getData(path = "") {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - Could not load file from URL.`);
    }

    const contentString = await response.text();
    
    return contentString;
}

function getDivAndParentEl(divSelector) {
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

    return {
        element: div,
        parent: parent

    };
}

function percentage(divSelector, percentage, dimension) {
    let divAndParent = getDivAndParentEl(divSelector)

    if (!divAndParent) {
        return
    }

    let parent = divAndParent.parent;

    parentDimension = (dimension === "width") ? parent.offsetWidth : parent.offsetHeight 
    caculatedDimension = parentDimension * percentage / 100;

    return caculatedDimension
}

async function getDataJSON(jsonPath) {
    const response = await getData(jsonPath);
    const dataObject = JSON.parse(response);

    return dataObject;
}

function toArrayOfArrays(file) {
    return file
        .split("\n")                   
        .map(line => line.trim())      
        .filter(line => line.length)  
        .map(line => line.split(/\s+/)); 
}



function extractBondData(molblock) {
    let molblockArray = toArrayOfArrays(molblock)
    let numAtomStr = molblockArray[1][0]
    let numAtom = Number(numAtomStr)
    let bondDataArray = molblockArray.slice(numAtom + 2, molblockArray.length - 1);

    return bondDataArray;
}

function extractBondConnectivityData(molblock) {
    let bondData = extractBondData(molblock); 

    let connectivity = bondData.map(line => line.slice(0, 2));

    return connectivity;
}

function toFlatArray(nestedArray) {
    return nestedArray.flat();
}

function getEmptyBondIndex(molblock) {
    const nestedConnectivityData = extractBondConnectivityData(molblock);
    const connectivityData = toFlatArray(nestedConnectivityData).map(Number);
    const molblockArray = toArrayOfArrays(molblock);

    const numAtom = Number(molblockArray[1][0]);

    const emptyBond = [];

    const bondCounts = new Array(numAtom + 1).fill(0); // +1 for 1-based indexing
    for (const atom of connectivityData) {
        bondCounts[atom]++;
    }

    for (let i = 1; i <= numAtom; i++) {
        const atomLine = molblockArray[2 + i - 1]; 
        const atomType = atomLine[3]; 

        if (bondCounts[i] === 1 && atomType === "C") {
            emptyBond.push(i);
            console.log(atomLine[3])
        }
    }

    return emptyBond;
}

