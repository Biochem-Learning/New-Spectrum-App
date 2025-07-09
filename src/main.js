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
        clickedElement.className !== "frag-canvas" &&
        clickedElement.className !== "user-section" &&
        clickedElement.className !== "overlay" && 
        clickedElement.tagName !== "svg" &&
        clickedElement.id != "del-frag-button") {
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

let editMode = false;

function loadFragmentTable() {
    let fragTable = document.querySelector(".frag-table")
    for (let i = 0; i < 9; i++) {
        fetch("data/FragLibrary/frag" + i + ".svg")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load: " + response.status);
            }
            return response.text(); 
        })
        .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml").documentElement;
            
            svgDoc.addEventListener('mouseover', function() {
                this.style.cursor = 'pointer';
            })

            displayFragIntoCanvas(svgDoc)
            
            fragTable.appendChild(svgDoc);
        })
        .catch(error => {
            console.error("Error loading file: frag" + i + ".svg", error);
        });
    }
}

loadFragmentTable()


function displayFragIntoCanvas(frag) {
    frag.addEventListener("click", function() {
        let fragCanvas = document.querySelector('#frag-canvas');
        let clonedFrag = this.cloneNode(true); 
        clonedFrag.classList.add('frag-canvas-items');
        makeDeletable(clonedFrag)
        fragCanvas.appendChild(clonedFrag);
    });
}

document.querySelector("#del-frag-button").addEventListener("click", function() {
    editMode = toggleMode(editMode);
    displayOrHideElement2("jfdas")
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

    // Wait for RDKit to finish loading
let RDKitLoader = null;

function loadRDKit() {
  if (!RDKitLoader) {
    RDKitLoader = window.initRDKitModule()
      .then((RDKit) => {
        console.log("RDKit version: " + RDKit.version());
        return RDKit;
      })
      .catch((err) => {
        console.error("Failed to load RDKit module.", err);
        throw err;
      });
  }
  return RDKitLoader;
}

async function useRDKit() {
    let RDKit = await loadRDKit();
    const mol = RDKit.get_mol("ClC");
    console.log(mol.get_smiles());
}

useRDKit();

      // Location of available bond: at the beginning, at the end, and before ")"
                                       //    //    //   //

function dragAndDrop() {

    let selected1 = null;
    let selected2 = null;
    const canvas =  document.querySelector("#frag-canvas")
    
    canvas.addEventListener("mousedown", function (event) {
        const target = event.target.closest("svg");
        if (target) {
            selected1 = target;
            console.log("Selected 1:", selected1);
        }
    });

    canvas.addEventListener("mouseup", function (event) {
        const target = event.target.closest("svg");
        if (target) {
            selected2 = target;
            console.log("Selected 2:", selected2);

            if (selected1 && selected2 && selected1 !== selected2) {
                mergeImages(selected1, selected2);

                selected1 = null;
                selected2 = null;
            }
        }
    });
}

dragAndDrop()

async function mergeImages(selected1,selected2) {
    let RDKit = await loadRDKit();
    const svgString1 = decodeURIComponent(selected1.dataset.smiles);
    const svgString2Unconverted = decodeURIComponent(selected2.dataset.smiles);
    const svgString2 = removeOneBond(svgString2Unconverted);
    const canvas =  document.querySelector("#frag-canvas")

    const arr = svgString1.split("")
    let spliceIndex = null;

    if (arr[0] === "C" && arr[1] === "C") {
        spliceIndex = 0;
        console.log("Passed to first character");
        console.log(arr[0])
    } 
    else if (arr[arr.length - 1] === "C") {
        spliceIndex = arr.length - 1; // <-- fixed: insert at end
        console.log("Passed to last character");
    } 
    else {
        for (let i = 0; i < arr.length; i++) {
                if (arr[i] === "C" && arr[i + 1] === ")") {
                spliceIndex = i;
                console.log("Passed to middle character");
                break;
            }
        }
    }

    if (spliceIndex === null) {
        alert("No valid splice point found!");
        return;
    }

    arr.splice(spliceIndex, 1, svgString2);
    const mergedString = arr.join("");

    console.log("Merged SMILES:", mergedString);

    selected1.remove();
    selected2.remove();

    const mergedMol = RDKit.get_mol(mergedString);
    const mergedSvg = mergedMol.get_svg().replace(
        "<svg",
        `<svg data-smiles="${mergedString}"`
    );

    // dict.set(svg, smileStr);
    canvas.innerHTML += mergedSvg;

}

function removeOneBond(SMILEStr, position) {
    if (position == 0) {
        if (SMILEStr[-1] !== "C") {
            ///Communicate so that it can be mooved to onther position in the first bond
            return
        }

    }

    // for the second mol the connection point would ALWAYS be the first or last C bond depedning on situation, so if there is 
    // anything that is not C in the first or last position of the secondMOL string, move it to anther bond location
    // if molString2 is merged in the beginning of molString1: remove C at the end
    // if molString2 is merged in the middle or end of molString1: remove C in the beginning
    let newSmiles = SMILEStr.slice(0, -1);
    return newSmiles
}
  
// dragAndDrop()

// function dragAndDrop() {
//     let canvas = document.querySelector("#frag-canvas");

//     let selected1 = null;
//     let selected2 = null;
    
//     canvas.addEventListener("mousedown", function (event) {
//         const target = event.target.closest("svg");
//         if (target) {
//             selected1 = target;
//             console.log("Selected 1:", selected1);
//         }
//     });

//     canvas.addEventListener("mouseup", function (event) {
//         const target = event.target.closest("svg");
//         if (target) {
//             selected2 = target;
//             console.log("Selected 2:", selected2);

//             if (selected1 && selected2 && selected1 !== selected2) {
//                 mergeImages(selected1, selected2);

//                 // Clear selection after merging
//                 selected1 = null;
//                 selected2 = null;
//             }
//         }
//     });
// }

// function createMergedSvgContainer() {
//     const svgNS = "http://www.w3.org/2000/svg";
//     const xlinkNS = "http://www.w3.org/1999/xlink";

//     const svg = document.createElementNS(svgNS, "svg");

//     // Set attributes
//     svg.setAttribute("id", "mergedSvgContainer");
//     svg.setAttribute("style", `
//         cursor: pointer;
//         fill-opacity: 1;
//         text-rendering: auto;
//         stroke: black;
//         stroke-linecap: square;
//         stroke-miterlimit: 10;
//         shape-rendering: auto;
//         stroke-opacity: 1;
//         fill: black;
//         stroke-dasharray: none;
//         font-weight: normal;
//         stroke-width: 1;
//         font-family: 'Dialog';
//         font-style: normal;
//         stroke-linejoin: miter;
//         font-size: 12px;
//         stroke-dashoffset: 0;
//         image-rendering: auto;
//     `);
//     svg.setAttribute("width", "86");
//     svg.setAttribute("height", "16");
//     svg.setAttribute("viewBox", "0 0 86.0 16.0");
//     svg.setAttribute("xmlns", svgNS);
//     svg.setAttribute("xmlns:xlink", xlinkNS);

//     return svg; 
// }

// function mergeImages(svg1, svg2) {
//     let mergedSvg = createMergedSvgContainer();
//     let canvas = document.querySelector("#frag-canvas");

//     console.log(svg1)
//     console.log(svg2)

//     let svg1Children = Array.from(svg1.children);
//     let svg2Children = Array.from(svg2.children);

//     svg1Children.forEach(child => {
//         const clone = child.cloneNode(true);
//         if (clone.tagName.toLowerCase() === "g" && clone.attributes.length === 0) {
//             clone.classList.add("svg-group1");
//         }
//         mergedSvg.appendChild(clone);
//     });

//     svg2Children.forEach(child => {
//         const clone = child.cloneNode(true);
//         if (clone.tagName.toLowerCase() === "g" && clone.attributes.length === 0) {
//             clone.classList.add("svg-group1");
//         }
//         mergedSvg.appendChild(clone);
//     });

//     let svgElements = mergedSvg.querySelectorAll(".svg-group1"); // search inside mergedSvg only
//     if (svgElements.length >= 2) {
//         svgElements[0].setAttribute("transform", "translate(0, 0)");
//         svgElements[1].setAttribute("transform", "translate(43, 0)");
//     }

//     svg1.remove();
//     svg2.remove();

//     console.log("Merged elements:", svgElements);
//     makeDeletable(mergedSvg)
//     canvas.appendChild(mergedSvg);
    
// }

function changeCursor(cursorType) {
    document.body.style.cursor = cursorType;
}


function toggleMode(currentMode) {
    return !currentMode;
}

function makeDeletable(element) {
    element.addEventListener('click', function() {
        if (editMode) {
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