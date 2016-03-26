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

    var data = {
        selectedPartElement: null,
        highlightedPartElement: null,
    }
    var highlightColor = "#F9E400";
    var modelSelector = modelContainerSelector + " a-entity";

    var setHighlightColor = function (part) {
        removeHighlightColor();

        var element = $(part).get(0);
        if (element.originalColor == undefined)
            element.originalColor = element.components.material.data.color;

        element.setAttribute("material", "color", highlightColor);
        data.highlightedPartElement = element
    }

    var removeHighlightColor = function () {
        if (!data.highlightedPartElement)
            return;

        data.highlightedPartElement.setAttribute("material", "color", data.highlightedPartElement.originalColor);
        data.highlightedPartElement = null;
    }

    var selectPart = function (part) {
        removeHighlightColor();

        // Dim all other parts
        data.selectedPartElement = $(part).get(0);
        $(modelSelector).each(function (i, otherPart) {
            var otherPartElement = $(otherPart).get(0);
            if (otherPartElement != data.selectedPartElement)
                otherPartElement.setAttribute("material", "opacity", "0.1")
        })

        data.selectedPartElement.addState("selected");
    }

    var deselectPart = function () {
        $(modelSelector).each(function (i, part) {
            var partElement = $(this).get(0);
            partElement.setAttribute("material", "opacity", "1")
        })

        data.selectedPartElement.removeState("selected");
        data.selectedPartElement = null;
    }

    $(modelSelector).on("stateadded", function (e) {
        if (data.selectedPartElement)
            return;
            
        setHighlightColor(this);
    })
    $(modelSelector).on("stateremoved", function (e) {
        if (data.selectedPartElement)
            return;

        removeHighlightColor(this);
    })

    var lastCall = 0;
    $(modelSelector).on("click", function (e) {
        // For some reason the click event is executed twice.
        // Make sure a half second passes before we call it again
        if (new Date() - lastCall < 500)
            return;
        lastCall = new Date();

        // If a part is selected deselect it
        if (data.selectedPartElement) {
            deselectPart();
        }
        else {
            selectPart(this);
        }
    })

    return data;
}