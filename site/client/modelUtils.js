ModelUtils = {};

ModelUtils.load = function (partsInfo, modelContainerSelector, controller, loaded) {
    // Add model parts
    var folder = partsInfo.folder;
    var loadedCount = 0;
    partsInfo.parts.forEach(function (partInfo) {
        var part = $("<a-entity material='color: " + partInfo.color + ";' obj-model='obj: url(" + folder +  partInfo.file + ");'></a-entity>");
        part.data("partInfo", partInfo);
        $(modelContainerSelector).append(part)

        $(part).on("model-loaded", function (e) {
            e.detail.model.traverse(function (child) {
                child.el = e.target
            });
            if (++loadedCount == partsInfo.parts.length)
                $(modelContainerSelector).get(0).emit("models-loaded");
        })
    });

    controller.use("rotateAndZoom", { container: $(modelContainerSelector).get(0) });

    var selectedPartElement = null;
    var highlightedPartElement = null;
    var highlightColor = "#F9E400";
    var modelSelector = modelContainerSelector + " a-entity";

    var setHighlightColor = function (part) {
        removeHighlightColor();

        var element = $(part).get(0);
        if (element.originalColor == undefined)
            element.originalColor = element.components.material.data.color;

        element.setAttribute("material", "color", highlightColor);
        highlightedPartElement = element
    }

    var removeHighlightColor = function () {
        if (!highlightedPartElement)
            return;

        highlightedPartElement.setAttribute("material", "color", highlightedPartElement.originalColor);
        highlightedPartElement = null;
    }

    var selectPart = function (part) {
        removeHighlightColor();

        // Dim all other parts
        selectedPartElement = $(part).get(0);
        $(modelSelector).each(function (i, otherPart) {
            var otherPartElement = $(otherPart).get(0);
            if (otherPartElement != selectedPartElement)
                otherPartElement.setAttribute("material", "opacity", "0.1")
        })
    }

    var deselectPart = function () {
        $(modelSelector).each(function (i, part) {
            var partElement = $(this).get(0);
            partElement.setAttribute("material", "opacity", "1")
        })
        selectedPartElement = null;
    }

    var actionKey = null;
    canClick = true;
    controller.on("rotateEnd, zoomEnd", function () {
        canClick = false;
        if (actionKey)
            clearTimeout(actionKey);
        actionKey = setTimeout(function () { canClick = true; }, 500)
    });

    $(modelSelector).on("stateadded", function (e) {
        if (selectedPartElement)
            return;
            
        setHighlightColor(this);
    })
    $(modelSelector).on("stateremoved", function (e) {
        if (selectedPartElement)
            return;

        removeHighlightColor(this);
    })

    var lastCall = 0;
    $(modelSelector).on("click", function (e) {
        if (!canClick || controller.rotateAndZoom.rotating || controller.rotateAndZoom.zooming)
            return;
            
        // For some reason the click event is executed twice.
        // Make sure a half second passes before we call it again
        if (new Date() - lastCall < 500)
            return;
        lastCall = new Date();

        // If a part is selected deselect it
        if (selectedPartElement) {
            deselectPart();
        }
        else {
            selectPart(this);
        }
    })
}