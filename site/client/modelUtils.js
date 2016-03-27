ModelUtils = {};

ModelUtils.load = function (partsInfo, modelContainerSelector, controller, maxDimension) {
    var scene = $("a-scene").get(0);

    var modelSelector = modelContainerSelector + " a-entity";

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

            // When all the models are loaded, scale them and fire a models loaded event
            if (++loadedCount == partsInfo.parts.length) {
                var scale = Utils.getScaleForMaxDimension($(modelContainerSelector).get(0), maxDimension)
                $(modelSelector).each(function () {
                    $(this).get(0).setAttribute("scale", scale + " " + scale + " " + scale)
                    $(this).get(0).originalScale = scale;
                });

                $(modelContainerSelector).get(0).emit("models-loaded");
            }  
        })
    });

    var data = {
        selectedPartElement: null,
        highlightedPartElement: null,
        grabbedPartElement: null,
    }
    var highlightColor = "#F9E400";

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

    var grabPart = function (hand) {
        data.grabbedPartElement = data.selectedPartElement;
        hand.data("grabbedPartElement", data.grabbedPartElement)

        hand.data("pointer").attachChild(data.grabbedPartElement);

        data.grabbedPartElement.setAttribute("position", "0 0 0");

        var scale = Utils.getScaleForMaxDimension(data.grabbedPartElement, 0.5)
        data.grabbedPartElement.setAttribute("scale", scale + " " + scale + " " + scale);

        console.log("grabing part")
    }

    var ungrabPart = function (hand) {
        deselectPart();
        
        hand.data("pointer").detachChild(data.grabbedPartElement, $(modelContainerSelector).get(0));
        data.grabbedPartElement.setAttribute("position", "0 0 0");
        data.grabbedPartElement.setAttribute("rotation", "0 0 0");

        var scale = data.grabbedPartElement.originalScale;
        data.grabbedPartElement.setAttribute("scale", scale + " " + scale + " " + scale);

        data.grabbedPartElement = null;
        hand.data("grabbedPartElement", null)
        console.log("ungrabing part")
    }

    $(modelSelector).on("stateadded", function (e) {
        if (data.selectedPartElement || e.detail.state != "hovered")
            return;
            
        setHighlightColor(this);
    })
    $(modelSelector).on("stateremoved", function (e) {
        if (data.selectedPartElement || e.detail.state != "hovered")
            return;

        removeHighlightColor(this);
    })

    var lastClick = 0;
    var canClick = function () {
        return Date.now() - lastClick > 1000 && data.grabbedPartElement == null;
    }
    $(modelSelector).on("click, pointerTouch", function (e) {
        if (!canClick())
            return;

        // If a part is selected deselect it
        if (data.selectedPartElement) 
            deselectPart();
        else
            selectPart(this);

        lastClick = Date.now();
    })

    controller.use('pinchEvent', {
        pinchThreshold: 0.9,
        grabThreshold: 0.8,
    });
    var isGrabbingPart = function (hand) {
        return data.grabbedPartElement != null && hand.data("grabbedPartElement") != null;
    }
    controller.on("pinch", function (hand) {
        if (!isGrabbingPart(hand) && data.selectedPartElement != null)
            grabPart(hand);
    })
    .on("unpinch", function (hand) {
        if (isGrabbingPart(hand))
            ungrabPart(hand);
    })

    return data;
}