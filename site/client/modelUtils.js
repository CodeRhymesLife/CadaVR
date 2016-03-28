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

    var setHighlightColor = function (element) {
        removeHighlightColor();

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

        if (data.selectedPartElement.is("hovered"))
            setHighlightColor(data.selectedPartElement)

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

    controller.use("pointer", { debug: true });
    $(modelSelector).on("stateadded", function (e) {
        if (data.selectedPartElement || e.detail.state != "pointerHovered")
            return;
            
        setHighlightColor($(this).get(0));
    })
    $(modelSelector).on("stateremoved", function (e) {
        if (data.selectedPartElement || e.detail.state != "pointerHovered")
            return;

        removeHighlightColor();
    })

    var lastClick = 0;
    var canTouch = function () {
        return Date.now() - lastClick > 1000 && !data.grabbingElement && !rotate;
    }
    var touchPoint = null;
    $(modelSelector).on("pointerTouch", function (e) {
        if (!canTouch())
            return;

        // If a part is selected deselect it
        if (data.selectedPartElement) {
            deselectPart();
        }
        else {
            touchPoint = e.detail.intersectedObj.point;
            selectPart(this);
        }

        lastClick = Date.now();
    })

    controller.use('pinchEvent', {
        pinchThreshold: 0.9,
        grabThreshold: 0.8,
    });

    
    var rotate = false;
    var rotationContainer = $(modelContainerSelector).get(0);
    Leap.loop({ background: true }, {
        hand: function (hand) {
            if (!hand.data('pinchEvent.pinching'))
                return;

            if (!isGrabbingPart(hand) && canGrab(hand) && hand.data("pointer").getWorldPosition().distanceTo(touchPoint) > 0.3) {
                rotate = false;
                grabPart(hand);
            }

            if (rotate && controller.frame(1).hand(hand.id)) {
                var lastHand = controller.frame(1).hand(hand.id);
                var currentHand = controller.frame(0).hand(hand.id);

                var deltaPosition = {
                    x: currentHand.palmPosition[0] - lastHand.palmPosition[0],
                    y: currentHand.palmPosition[1] - lastHand.palmPosition[1],
                };

                var rotationFactor = 1000;
                var rotation = rotationContainer.getAttribute("rotation") || { x: 0, y: 0, z: 0 };
                rotation.x -= deltaPosition.y * rotationFactor;
                rotation.y += deltaPosition.x * rotationFactor;
                rotationContainer.setAttribute("rotation",
                    String(rotation.x) + " " +
                    String(rotation.y) + " " +
                    String(rotation.z));
            }
        },
    });

    var isGrabbingPart = function (hand) {
        return hand.data("pointer") != null && hand.data("pointer").hasChild();
    }
    var canGrab = function (hand) {
        return hand.data("pointer") && !isGrabbingPart(hand) && data.selectedPartElement != null;
    }
    controller.on("pinch", function (hand) {
        rotate = !isGrabbingPart(hand) && data.selectedPartElement != null;
    })
    .on("unpinch", function (hand) {
        rotate = false;
        if (isGrabbingPart(hand))
            setTimeout(function () { ungrabPart(hand); });
    })
    .on('handLost', function (hand) {
        // "Throw awway" the element when the hand is lost"
        var lastHand = controller.frame(1).hand(hand.id)
        if (isGrabbingPart(lastHand)) {
            lastHand.data("pointer").childElement.setAttribute("visible", "false")
        }
    })

    return data;
}