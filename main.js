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

    if (clickedElement.className !== "frag-table") {
        clickout(".frag-table");
    }
});


