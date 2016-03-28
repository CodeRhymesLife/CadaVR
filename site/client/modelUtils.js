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
        grabbingElement: false,
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
        console.log("grabing part")

        var grabbedElement = hand.data("pointer").attachChild(data.selectedPartElement);
        data.grabbingElement = true;

        grabbedElement.setAttribute("position", "0 0 0");

        var scale = Utils.getScaleForMaxDimension(grabbedElement, 0.5)
        grabbedElement.setAttribute("scale", scale + " " + scale + " " + scale);

        return grabbedElement;
    }

    var ungrabPart = function (hand) {
        console.log("ungrabing part")

        deselectPart();
        
        var grabbedElement = hand.data("pointer").detachChild($(modelContainerSelector).get(0));
        data.grabbingElement = false;

        grabbedElement.setAttribute("position", "0 0 0");
        grabbedElement.setAttribute("rotation", "0 0 0");

        var scale = grabbedElement.originalScale;
        grabbedElement.setAttribute("scale", scale + " " + scale + " " + scale);

        return grabbedElement;
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
    var canTouch = function () {
        return Date.now() - lastClick > 1000 && !data.grabbingElement;
    }
    var touchPoint = null;
    $(modelSelector).on("pointerTouch", function (e) {
        if (!canTouch())
            return;

        // If a part is selected deselect it
        if (data.selectedPartElement) {
            deselectPart();
            touchPosition = null;
        }
        else {
            touchPoint = e.detail.intersectedObj.point;
            selectPart(this);
        }

        lastClick = Date.now();
    })

    controller.use('pinchEvent', {
        pinchThreshold: 0.7,
        grabThreshold: 0.8,
    });
    var isGrabbingPart = function (hand) {
        return hand.data("pointer") != null && hand.data("pointer").hasChild();
    }
    var canGrab = function (hand) {
        var pointer = hand.data("pointer")
        if(pointer != null && !isGrabbingPart(hand) && data.selectedPartElement) {
            var distance = pointer.getWorldPosition().distanceTo(touchPoint);
            console.log("grab distance: " + distance);
            return distance <= pointer.touchDistance;
        }

        return false;
    }
    controller.on("pinch", function (hand) {
        if (canGrab(hand))
            grabPart(hand);
    })
    .on("unpinch", function (hand) {
        if (isGrabbingPart(hand))
            ungrabPart(hand);
    })
    .on('handLost', function (hand) {
        // "Throw awway" the element when the hand is lost"
        if (isGrabbingPart(hand)) {
            var grabbedElement = ungrabPart(hand)
            grabbedElement.setAttribute("visible", "false")
        }
    });

    return data;
}