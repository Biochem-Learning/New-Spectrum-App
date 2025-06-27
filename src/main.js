const MOL_CANVAS_WIDTH = 90; ///Change this to percentage(100) for cleaner code
const MOL_CANVAS_HEIGHT = 90; ///Change this to percentage(100) for cleaner code
const SPEC_CANVAS_WIDTH = 95; ///Change this to percentage(100) for cleaner code
const SPEC_CANVAS_HEIGHT = 95; ///Change this to percentage(100) for cleaner code
const USER_CANVAS_WIDTH = 100; ///Change this to percentage(100) for cleaner code
const USER_CANVAS_HEIGHT = 100; ///Change this to percentage(100) for cleaner code

const MOL_CANVAS_ID = "sample_molecule";
const SPEC_CANVAS_ID = "sample_spectrum";

const SPEC_DESCRIPTION_TEXTBOX =  document.querySelector(".spec-desc"); 

let displayingMol = "Ethanol"
let viewingMode = "MS"

let dataJSON;

// Usage
// (async function () {
//     const jsonFilePath = "data/Spectra/SpecDescription/Ethanol.json";
//     try {
//         dataJSON = await loadJSONData(jsonFilePath);
//         console.log(dataJSON); // Work with your JSON data here
//     } catch (error) {
//         console.error("Error during data loading:", error);
//     }
// })();

/// Problem: Extreme Inefficient (The App fetch JSON every mousemove)

let canvases = setUpCanvas(
    'data/Spectra/' + viewingMode + '/' + displayingMol + viewingMode + '.jdx',
    MOL_CANVAS_ID,
    SPEC_CANVAS_ID,
    MOL_CANVAS_WIDTH,
    MOL_CANVAS_HEIGHT,
    SPEC_CANVAS_WIDTH,
    SPEC_CANVAS_HEIGHT,
);

// let userCanvas = setUpSketcherCanvas(
//     "frag-canvas", 
//     USER_CANVAS_WIDTH, 
//     USER_CANVAS_HEIGHT
// );

// function setUpSketcherCanvas(canvasId, width, height) {
// 	// Initiate the canvas
// 	const options = {
// 		useService: true,
// 		oneMolecule: false,
// 		// isMobile: true,
// 	};

// 	// Set up the ChemDoodle SketcherCanvas component
// 	ChemDoodle.ELEMENT["H"].jmolColor = "black";
// 	ChemDoodle.ELEMENT["S"].jmolColor = "#B9A130";
// 	const sketcher = new ChemDoodle.SketcherCanvas(
//         canvasId, 
//         percentage("#" + canvasId, width, "width"), 
//         percentage("#" + canvasId, height, "height"), 
//         options);

// 	sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
// 	sketcher.styles.atoms_useJMOLColors = true;
// 	sketcher.styles.bonds_clearOverlaps_2D = true;
// 	sketcher.styles.shapes_color = "c10000";

// 	return sketcher;
// }

createCompoundSubmenu("data/Spectra/CompondMenu.txt")

dragElement(".frag-table", ".f-t-general-instr");

displayGeneralText(displayingMol)

///////////////////////
/// WINDOW BEHAVIORS///
///////////////////////

document.querySelector(".frag-table-button").addEventListener("click", function() {
    event.stopPropagation()
    displayOrHideElement(".frag-table");
});

document.addEventListener("click", function() {
    const clickedElement = event.target

    if (clickedElement.className !== "frag-table" && 
        clickedElement.className !== "f-t-general-instr" &&
        clickedElement.className !== "frag-table-items" &&
        clickedElement.className !== "frag-canvas" &&
        clickedElement.className !== "frag-canvas-items" && 
        clickedElement.className !== "user-section" &&
        clickedElement.className !== "overlay") {
        clickout(".frag-table");
    }
});

document.querySelectorAll(".nav-bar-section").forEach(button => {
    button.addEventListener("click", function() {
        if (this.id === "compounds") {
            displayGeneralText(displayingMol)
            return;
        }
        canvases = setUpCanvas('data/Spectra/' + this.id + '/' + displayingMol + this.id + '.jdx',
            MOL_CANVAS_ID,
            SPEC_CANVAS_ID,
            MOL_CANVAS_WIDTH,
            MOL_CANVAS_HEIGHT,
            SPEC_CANVAS_WIDTH,
            SPEC_CANVAS_HEIGHT,
        ) 
        viewingMode = this.id;
        displayGeneralText(displayingMol, this.id)
    });
})

let deleteMode = false;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".frag-table-items").forEach(item => {
        item.addEventListener("click", function() {
            if (item.id !== "del-frag-button") {
                let fragCanvas = document.querySelector('#frag-canvas');
                let frag = document.createElement("img");
                frag.src = item.src;
                frag.classList.add("frag-canvas-items")

                makeDeletable(frag)

                fragCanvas.appendChild(frag);
            }
            else {
                deleteMode = toggleMode(deleteMode);
                displayOrHideElement2("jfdas")
                if (deleteMode) {
                    changeCursor('wait');
                }
                else {
                    changeCursor('default');
                }
            }
        });
    })
})

function displayOrHideElement2(elementSelector) {
    let element = document.querySelector(".overlay")
    let element2 = document.querySelector("#del-frag-button")
    if (window.getComputedStyle(element).display === "none") {
        element.style.display = "block";
        element2.innerText = "Close Frag Edit Mode";
    }
    else {
        element.style.display = "none";
        element2.innerText = "Open Frag Edit Mode";
    }
}

function changeCursor(cursorType) {
    document.body.style.cursor = cursorType;
}


function toggleMode(currentMode) {
    return !currentMode;
}

function makeDeletable(element) {
    element.addEventListener('click', function() {
        if (deleteMode) {
            this.remove(); 
            console.log('Element removed:', this);
        }
    });
}
    
// document.addEventListener('DOMContentLoaded', () => {
//     let currentX = 0; // Track the current x position on the canvas
//     let currentY = 0; // Track the current y position on the canvas

//     const imgWidth = 100; // Set the width of each image
//     const imgHeight = 100; // Set the height of each image
//     const spacing = 10; // Spacing between images

//     document.querySelectorAll(".frag-table-items").forEach(item => {
//         item.addEventListener("click", function () {
//             let fragCanvas = document.querySelector('#frag-canvas');
//             let ctx = fragCanvas.getContext('2d');

//             let imgSource = item.src;

//             if (imgSource) {
//                 let img = new Image();
//                 img.src = imgSource;

//                 img.onload = () => {
//                     // Check if there's enough space on the current row
//                     if (currentX + imgWidth > fragCanvas.width) {
//                         // Move to the next row
//                         currentX = 0;
//                         currentY += imgHeight + spacing;
//                     }

//                     // Check if there's enough space vertically

//                     // Draw the image at the current position
//                     ctx.drawImage(img, currentX, currentY, imgWidth, imgHeight);

//                     // Update the x position for the next image
//                     currentX += imgWidth + spacing;
//                 };
//             } else {
//                 console.error("Invalid image source");
//             }
//         });
//     });
// });

window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
};

async function setUpCanvas(path='', molCanvasId, specCanvasId, molWidth, molHeight, specWidth, specHeight) {
    removeCanvas(molCanvasId)
    removeCanvas(specCanvasId)

    let data = await getData(path) 

    let canvas = new ChemDoodle.io.JCAMPInterpreter().makeStructureSpectrumSet(
        'sample', 
        data, 
        percentage("#" + molCanvasId, molWidth, "width"), 
        percentage("#" + molCanvasId, molHeight, "height"), 
        percentage("#" + specCanvasId, specWidth, "width"), 
        percentage("#" + specCanvasId, specHeight, "height"),
    )

    console.log(canvas);
    return canvas;
}

window.addEventListener('resize', function() {
    canvases = setUpCanvas(
        'data/Spectra/' + viewingMode + '/' + displayingMol + viewingMode + '.jdx',
        MOL_CANVAS_ID,
        SPEC_CANVAS_ID,
        MOL_CANVAS_WIDTH,
        MOL_CANVAS_HEIGHT,
        SPEC_CANVAS_WIDTH,
        SPEC_CANVAS_HEIGHT
    )
});

function removeCanvas(canvasId) {
	let canvasAndParent = getDivAndParentEl("#" + canvasId);

    if (!canvasAndParent) {
        return
    }

    let canvas = canvasAndParent.element;
    let parent = canvasAndParent.parent;
    let newCanvas = document.createElement("canvas");
    
    newCanvas.id = canvasId;

	parent.replaceChild(newCanvas, canvas);
}

async function createCompoundSubmenu(menuFilePath) {
    let dropdownMenu = document.querySelector(".dropdown");  

    let ddContentWrapper = document.createElement("div");
    ddContentWrapper.classList.add("dropdown-content");

    dropdownMenu.appendChild(ddContentWrapper);

    fetch(menuFilePath)
    .then(response => response.text())
    .then(data => {
        const lines = data.split('\n');
        const itemArray = lines.map(line => line.trim()).filter(line => line !== '');
        
        for(let i = 0; i < itemArray.length; i += 1) {
            let subItem = document.createElement("a");
            subItem.textContent = itemArray[i];
            subItem.id = "dropdown-item-" + i;
            subItem.classList.add('dropdown-item');
            ddContentWrapper.appendChild(subItem);

            subItem.addEventListener('click', function(event) {
                event.preventDefault(); 
                displayingMol = itemArray[i];

                canvases = setUpCanvas('data/Spectra/MS/' + displayingMol + 'MS.jdx',
                    MOL_CANVAS_ID,
                    SPEC_CANVAS_ID,
                    MOL_CANVAS_WIDTH,
                    MOL_CANVAS_HEIGHT,
                    SPEC_CANVAS_WIDTH,
                    SPEC_CANVAS_HEIGHT
                )

                displayGeneralText(displayingMol)
            });
        }
    })
    .catch(error => console.error('Error reading file:', error));

}

async function loadAndStoreData() {
    const jsonFilePath = "data/Spectra/SpecDescription/Ethanol.json"; // Your JSON file path

    try {
        dataJSON = await getJsonData(jsonFilePath);

    } catch (error) {
        console.error("Failed to load and process data:", error);
    }
}

///Not good, need rewrite
async function displayGeneralText(molecule,mode="",textBoxEl=SPEC_DESCRIPTION_TEXTBOX) {
    const dataJSON = await getDataJSON("data/Spectra/SpecDescription/" + molecule +".json");
    switch (mode) {
        case "":
            textBoxEl.innerText = dataJSON.description;
            break
        case "MS":
            textBoxEl.innerText = dataJSON.spectra_info.MS.general_description;
            break
        case "IR":
            textBoxEl.innerText = dataJSON.spectra_info.IR.general_description;
            break
        case "HNMR":
            textBoxEl.innerText = dataJSON.spectra_info.HNMR.general_description;
            break
        case "CNMR":
            textBoxEl.innerText = dataJSON.spectra_info.CNMR.general_description;
            break
    }
}

async function displayTextWhenHovered(hoveredEl, mode, mol, textBoxEl) {
    const dataJSON = await getDataJSON("data/Spectra/SpecDescription/" + mol + ".json");

    if (!textBoxEl) {
        console.error("Error: Element with class '.spec-desc' not found.");
        return; 
    }

    if (hoveredEl && typeof hoveredEl.x === 'number' && hoveredEl.x !== null && !isNaN(hoveredEl.x)) {

        let peaksFromJSON;
        switch (mode) {
            case "MS":
                peaksFromJSON = dataJSON?.spectra_info?.MS?.peaks;
                break
            case "IR":
                peaksFromJSON = dataJSON?.spectra_info?.IR?.peaks;
                break
            case "HNMR":
                peaksFromJSON = dataJSON?.spectra_info?.HNMR?.peaks;
                break
            case "CNMR":
                peaksFromJSON = dataJSON?.spectra_info?.CNMR?.peaks;
                break
        }

        if (Array.isArray(peaksFromJSON)) {
            for(let i = 0; i < peaksFromJSON.length; i += 1)  {
                
                if (hoveredEl.x == peaksFromJSON[i].x) { 
                    textBoxEl.innerText = peaksFromJSON[i].description;
                }
            }
        } else {
            console.warn("JSON does not contain a valid 'spectra_info.MS.peaks' array.");
        }

    } else {
        descriptionToShow = "Invalid hovered peak data provided.";
        console.warn("Invalid 'hovered' object or 'hovered.x' value:", hoveredEl);
    }
}

function removeTextWhenMoveout(textBoxEl) {
    textBoxEl.innerText = "";
}

function loadFragmentTable() {
    for(let i = 0; i < 33; i += 1) {
        let fragTable = document.querySelector(".frag-table");
        let fragIcon = document.createElement("img");
        fragIcon.id = "frag-table-item-" + i;
        fragIcon.classList.add('frag-table-items');
        fragIcon.setAttribute('src',"data/FragLibrary/frag" + i + ".png");
        fragTable.appendChild(fragIcon)
    }
}

loadFragmentTable()
///////////////////////
/// UNUSED FUNCTION ///
///////////////////////


/// Update these function if need to be used

// async function setupSpectrumInteractivity(canvases, mode, molecule) {
//     try {
//         const canvasesArray = await canvases;

//         const specJSON = await getDataJSON("data/Spectra/SpecDescription/" + molecule +".json");

//         let specCanvas = canvasesArray[1];

//         let targetCanvasElement = document.querySelector("#sample_spectrum");

//         targetCanvasElement.addEventListener("mousemove", async function(event) {
//             const xCoordinate = event.offsetX; 

//             let calculatedDataX = convertPxToChem(specCanvas, xCoordinate);
//             // console.log("Real X Coordinate " + xCoordinate)
//             console.log("Converted X Coordinate " + calculatedDataX)

//             displayTextWhenHovered(specJSON, calculatedDataX, mode)
//         });

//     } catch (mainSetupError) {
//         console.error("An error occurred during initial spectrum setup:", mainSetupError);
//     }
// }


// function convertPxToChem(canvas, xCoordinate) {
//     let spectrumData = canvas.spectrum.data;
//     let dataLength = spectrumData.length;
//     // console.log("Total data points:", dataLength);

//     let plotMinDataX = Math.min(spectrumData[0].x, spectrumData[dataLength - 1].x);
//     let plotMaxDataX = Math.max(spectrumData[0].x, spectrumData[dataLength - 1].x);
//     // console.log(spectrumData[0].x)
//     // console.log(spectrumData[dataLength - 1].x)

//     let dataRange = plotMaxDataX - plotMinDataX;
//     // console.log("Data range:", dataRange);

//     let canvasWidth = canvas.width;
//     // console.log("Canvas total pixel width:", canvasWidth);

//     let calculatedDataX = plotMaxDataX - (xCoordinate / canvasWidth) * dataRange;

//     return calculatedDataX.toFixed(0);
// }

// async function displayTextWhenHovered(dataJSON, hoveredX, mode="", elSelector=".spec-desc") {
//     let textBox = document.querySelector(elSelector); 
    
//     try {
//         if (mode === "") {
//             textBox.innerText = dataJSON.description;
//             console.log(dataJSON.general_description);
//         }
//         else {
//             let modeObj;
//             switch (mode) {
//                 case "MS":
//                     modeObj = dataJSON.spectra_info.MS;
//                     break
//                 case "IR":
//                     modeObj = dataJSON.spectra_info.IR;
//                     break
//                 case "HNMR":
//                     modeObj = dataJSON.spectra_info.HNMR;
//                     break
//                 case "CNMR":
//                     modeObj = dataJSON.spectra_info.CNMR;
//                     break
//             }

//             let peaksArray = modeObj.peaks

//             textBox.innerText = modeObj.general_description;

//             for(let i = 0; i < peaksArray.length; i += 1)  {
                
//                 if (hoveredX == Math.round(peaksArray[i].x)) { /// Should be a range arround this number, instead of only exactly this number
//                     console.log("hoveredX: " + hoveredX)
//                     console.log("peaksArray[i].x: " + Math.round(peaksArray[i].x))
//                     console.log(hoveredX == Math.round(peaksArray[i].x))
//                     textBox.innerText = peaksArray[i].description;
//                 }
//             }
//         }
        
//     } catch (jsonError) {
//         console.error("Error fetching or parsing JSON in mousemove:", jsonError);
//         textBox.innerHTML = "Error loading description."; // Inform user of error
//     }
// }

// setupSpectrumInteractivity(canvases, "MS","Ethanol")