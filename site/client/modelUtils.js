ModelUtils = {};

ModelUtils.load = function (partsInfo, modelContainerSelector, controller, maxDimension) {
    var scene = $("a-scene").get(0);

    var modelSelector = modelContainerSelector + " .model";

    // Add model parts
    var folder = partsInfo.folder;
    var loadedCount = 0;
    partsInfo.parts.forEach(function (partInfo) {
        var part = $("<a-entity class='model' material='color: " + partInfo.color + ";' obj-model='obj: url(" + folder +  partInfo.file + ");'></a-entity>");
		part.get(0).canGrab = true;
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
		if(!data.selectedPartElement)
			return;
		
        $(modelSelector).each(function (i, part) {
            var partElement = $(this).get(0);
            partElement.setAttribute("material", "opacity", "1")
        })

        data.selectedPartElement.removeState("selected");

        if (data.selectedPartElement.is("hovered"))
            setHighlightColor(data.selectedPartElement)

        data.selectedPartElement = null;
    }

    var grabPart = function (hand, elementToGrab) {
        console.log("grabing part")

        scene.object3D.updateMatrixWorld();
        var originalRotation = elementToGrab.object3D.getWorldRotation();

        var grabbedElement = hand.data("pointer").attachChild(hand.data("pointer").getTouchElement());

        grabbedElement.setAttribute("position", "0 0 0");

        grabbedElement.setAttribute("rotation", "0 0 0");
        Utils.RotateAroundWorldAxis(grabbedElement, new THREE.Vector3(1, 0, 0), originalRotation.x)
        Utils.RotateAroundWorldAxis(grabbedElement, new THREE.Vector3(0, 1, 0), originalRotation.y)
        Utils.RotateAroundWorldAxis(grabbedElement, new THREE.Vector3(0, 0, 1), originalRotation.z)

        var scale = Utils.getScaleForMaxDimension(grabbedElement, 0.5)
        grabbedElement.setAttribute("scale", scale + " " + scale + " " + scale);

        return grabbedElement;
    }

    var ungrabPart = function (hand) {
        console.log("ungrabing part")

        deselectPart();
        
        var grabbedElement = hand.data("pointer").detachChild($(modelContainerSelector).get(0));

        grabbedElement.setAttribute("position", "0 0 0");
        grabbedElement.setAttribute("rotation", "0 0 0");

        var scale = grabbedElement.originalScale;
        grabbedElement.setAttribute("scale", scale + " " + scale + " " + scale);

        return grabbedElement;
    }

    controller.use("pointer", { debug: false });
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

    var canTouch = function (hand) {
        return !isGrabbingPart(hand) && !isRotating(hand) && !isZooming(hand);
    }
    $(modelSelector).on("pointerTouch", function (e) {
        if (!canTouch(e.detail.pointer.hand))
            return;

        // If a part is selected deselect it
        if (data.selectedPartElement) {
            deselectPart();
        }
        else {
            selectPart(this);
        }
    })

    controller.use('pinchEvent', {
        pinchThreshold: 0.7,
        grabThreshold: 0.8,
    });

    
    var actionMode = null;	
    var modelContainer = $(modelContainerSelector).get(0);
	var lastPinchOrGrabLocation = null;
	var modelScaleAtlastPinchOrGrab = null;

    // Add a dummy rotation object that we can use to rotate the model container
    // There's probably a much, much, much better way to do this, but it's fucking late.
    var dummyRotationObject = new THREE.Group
    dummyRotationObject.position.copy(modelContainer.object3D.getWorldPosition())
    scene.object3D.add(dummyRotationObject);

	var geometry = new THREE.SphereGeometry( 0.01 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	var pointerSphere = new THREE.Mesh( geometry, material );
	scene.object3D.add( pointerSphere );

    Leap.loop({ background: true }, {
        hand: function (hand) {
            if (!hand.data("pointer") || isGrabbingPart(hand))
                return;
			
			var pointer = hand.data("pointer");
			
			if(pointer.intersectedObj) {
				pointerSphere.visible = true;
				pointerSphere.position.copy(pointer.intersectedObj.point);
			}
			else
				pointerSphere.visible = false;

			if(!isGrabbingPart(hand) && isPinchingOrGrabbing(hand) && pointer.getTouchElement() && pointer.getTouchElement().canGrab)
				grabPart(hand, pointer.getTouchElement())

            else if (isRotating(hand)) {
                var beforeRotation = dummyRotationObject.rotation.clone();
                dummyRotationObject.lookAt(pointer.getWorldPosition().clone());
                var afterRotation = dummyRotationObject.rotation.clone();

                // There's probably a much, much, much better way to do this, but it's fucking late.
                Utils.RotateAroundWorldAxis(modelContainer, new THREE.Vector3(1, 0, 0), afterRotation.x - beforeRotation.x)
                Utils.RotateAroundWorldAxis(modelContainer, new THREE.Vector3(0, 1, 0), afterRotation.y - beforeRotation.y)
                Utils.RotateAroundWorldAxis(modelContainer, new THREE.Vector3(0, 0, 1), afterRotation.z - beforeRotation.z)
            }
			
			else if (isZooming(hand)) {
				var diff = pointer.getWorldPosition().clone().sub(lastPinchOrGrabLocation.clone());
				var newScale = modelScaleAtlastPinchOrGrab + diff.z;
				console.log("new scale: " + newScale)
				modelContainer.setAttribute("scale", newScale + " " + newScale + " " + newScale)
			}
        },
    });

	var isRotating = function (hand) {
		return actionMode == "rotate" && !isGrabbingPart(hand) && isPinchingOrGrabbing(hand);
	}
	var isZooming = function (hand) {
		return actionMode == "zoom" && !isGrabbingPart(hand) && isPinchingOrGrabbing(hand);
	}
	var isPinchingOrGrabbing = function (hand) {
		return hand.data('pinchEvent.pinching') || hand.data('pinchEvent.pinching');
	}
    var isGrabbingPart = function (hand) {
        return hand.data("pointer") != null && hand.data("pointer").hasChild();
    }
	var handlePinchAndGrab = function (action, hand) {
		// Return unless this is the first aciton and this hand can perform the action
		if(isPinchingOrGrabbing(hand) || hand.data("pointer") == null)
			return;

		console.log(action)

		modelScaleAtlastPinchOrGrab = modelContainer.object3D.scale.x;
		lastPinchOrGrabLocation = hand.data("pointer").getWorldPosition().clone()
        dummyRotationObject.lookAt(hand.data("pointer").getWorldPosition().clone());
    };
    controller.on("pinch", function (hand) {
		handlePinchAndGrab("pinch", hand);
	})
	.on("grab", function (hand) {
		handlePinchAndGrab("grab", hand)
	})
	.on("unpinch", function (hand) {
		console.log("unpinch");
		
		if (isGrabbingPart(hand))
            setTimeout(function () { ungrabPart(hand) });
	})
	.on("ungrab", function (hand) {
		console.log("ungrab");
	})
	.on('handLost', function (hand) {
        // "Throw awway" the element when the hand is lost"
        if (isGrabbingPart(hand)) {
            hand.data("pointer").childElement.setAttribute("visible", "false")
            hand.data("pointer").childElement.addState("trashed")
        }
    });
	
	var globalActions = new GlobalActionsMenu();
	globalActions.onSelected(function (action) {
		actionMode = action;
	})

    return data;
}

function GlobalActionsMenu(buttons) {
	buttons = [
		{
			src: "images/rotate.png",
			action: "rotate",
		},
		{
			src: "images/zoom.png",
			action: "zoom",
		},
	];
	
	var unselectedScale = 0.1;
	var hoveredScale = 0.12;
	var selectedScale = 0.15;
	var self = this;
	
	this.init = function () {
		this.containerEl = $("<a-entity position='0 1.8 -1.5'></a-entity>");
	
		for(var buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
			this.createButton(buttonIndex);
		}
		
		$("a-scene").append(this.containerEl);
	}
	
	this.selectedCallback = null;
	this.onSelected = function (callback) {
		this.selectedCallback = callback;
	}
	
	this.createButton = function (buttonIndex) {
		var button = buttons[buttonIndex];
		var x = buttonIndex * 0.3;
		var buttonEl = $("<a-box class='globalAction' position='" + x + " 0 0' scale='" + unselectedScale + " " + unselectedScale + " " + unselectedScale + "' src='" + button.src + "' color='white'></a-box>")
		
		this.containerEl.append(buttonEl);
		
		buttonEl.on("stateadded", function (e) {
			if(e.detail.state == "pointerHovered" && !buttonEl.get(0).selected )
				buttonEl.get(0).setAttribute("scale", hoveredScale + " " + hoveredScale + " " + hoveredScale);
		})
		.on("stateremoved", function (e) {
			if(e.detail.state == "pointerHovered" && !buttonEl.get(0).selected)
				buttonEl.get(0).setAttribute("scale", unselectedScale + " " + unselectedScale + " " + unselectedScale);
		})
		.on("pointerTouch", function (e) {		
			$(".globalAction").each(function () {
				if($(this).get(0) != buttonEl.get(0)) {
					$(this).get(0).selected = false;
					$(this).get(0).setAttribute("scale", unselectedScale + " " + unselectedScale + " " + unselectedScale);
				}
			})
			
			if(buttonEl.get(0).selected = !buttonEl.get(0).selected) {
				buttonEl.get(0).setAttribute("scale", selectedScale + " " + selectedScale + " " + selectedScale);
				self.selectedCallback(button.action)
			}
			else {
				buttonEl.get(0).setAttribute("scale", unselectedScale + " " + unselectedScale + " " + unselectedScale);
				self.selectedCallback(null)
			}			
		})
	}
	
	this.init();
}