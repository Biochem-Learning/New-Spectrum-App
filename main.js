const MOL_CANVAS_WIDTH = 90;
const MOL_CANVAS_HEIGHT = 90;
const SPEC_CANVAS_WIDTH = 95;
const SPEC_CANVAS_HEIGHT = 95;

const SPEC_DESCRIPTION_TEXTBOX =  document.querySelector(".spec-desc"); 

let displayingMol = "Ethanol"
let viewingMode = "MS"

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

/// Change alert
window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
};

/// !!!NOTICE: For anyone who try to work on this part, the original ChemDoodle lib only support 

async function setUpCanvas(path='', molCanvasId, specCanvasId) {
    removeCanvas(molCanvasId)
    removeCanvas(specCanvasId)

    let data = await getData(path) 

    let canvas = new ChemDoodle.io.JCAMPInterpreter().makeStructureSpectrumSet(
        'sample', 
        data, 
        percentage("#" + molCanvasId, MOL_CANVAS_WIDTH, "width"), 
        percentage("#" + molCanvasId, MOL_CANVAS_HEIGHT, "height"), 
        percentage("#" + specCanvasId, SPEC_CANVAS_WIDTH, "width"), 
        percentage("#" + specCanvasId, SPEC_CANVAS_HEIGHT, "height"),
    )

    console.log(canvas);
    return canvas;
}

const MOL_CANVAS_ID = "sample_molecule";
const SPEC_CANVAS_ID = "sample_spectrum";
let canvases = setUpCanvas(
    'data/Spectra/' + viewingMode + '/' + displayingMol + viewingMode + '.jdx',
    MOL_CANVAS_ID,
    SPEC_CANVAS_ID
);


if (SPEC_DESCRIPTION_TEXTBOX.innerText === "") {
    alert("Go fuck yourself")
}

async function initializeCanvas(canvas, url="") {
    
}

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

                canvases = setUpCanvas('data/Spectra/MS/' + displayingMol + 'MS.jdx',/// Might change to return instead
                    MOL_CANVAS_ID,
                    SPEC_CANVAS_ID
                )

                displayGeneralText(displayingMol)
            });
        }
    })
    .catch(error => console.error('Error reading file:', error));

}


function refreshCanvas() {

}

createCompoundSubmenu("data/Spectra/CompondMenu.txt")

document.querySelectorAll(".nav-bar-section").forEach(button => {
    button.addEventListener("click", function() {
        if (this.id === "compounds") {
            displayGeneralText(displayingMol)
            return;
        }
        canvases = setUpCanvas('data/Spectra/' + this.id + '/' + displayingMol + this.id + '.jdx',
            MOL_CANVAS_ID,
            SPEC_CANVAS_ID
        ) 
        viewingMode = this.id;
        displayGeneralText(displayingMol, this.id)
    });
})

async function getDataJSON(jsonPath) {
    const response = await getData(jsonPath);
    const dataObject = JSON.parse(response);

    return dataObject;
}

displayGeneralText(displayingMol)

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

/// Things need to be done:
/// - Redesign the system for adding text description (which function need to be written and what 
// parameter need to go inside which function)
/// - Add function for text description for each viewing mode
/// - Add ratio calculation for viewing mode other than MS 
/// - Need to return the text to general description when hover out of the canvas
/// - 3.5 is rounded up

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