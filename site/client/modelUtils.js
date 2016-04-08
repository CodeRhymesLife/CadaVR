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

		var newColor = Utils.blendColors(element.originalColor, "#FFFFFF", 0.2);
        element.setAttribute("material", "color", newColor);
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

        var grabbedElement = hand.data("pointer").attachChild(elementToGrab);

        grabbedElement.setAttribute("position", "0 0 0");

        grabbedElement.setAttribute("rotation", "0 0 0");
        Utils.RotateAroundWorldAxis(grabbedElement, new THREE.Vector3(1, 0, 0), originalRotation.x)
        Utils.RotateAroundWorldAxis(grabbedElement, new THREE.Vector3(0, 1, 0), originalRotation.y)
        Utils.RotateAroundWorldAxis(grabbedElement, new THREE.Vector3(0, 0, 1), originalRotation.z)

        var scale = Utils.getScaleForMaxDimension(grabbedElement, 0.1)
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
        if (actionMode != null || data.selectedPartElement || e.detail.state != "pointerHovered")
            return;
            
        setHighlightColor($(this).get(0));
    })
    $(modelSelector).on("stateremoved", function (e) {
        if (actionMode != null || data.selectedPartElement || e.detail.state != "pointerHovered")
            return;

        removeHighlightColor();
    })

    var canTouch = function (hand) {
        return !isGrabbingPart(hand) && !isRotating(hand) && !isZooming(hand);
    }
    $(modelSelector).on("pointerTouch", function (e) {
        if (actionMode != null || !canTouch(e.detail.pointer.hand))
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

    Leap.loop({ background: true }, {
        hand: function (hand) {
            if (!hand.data("pointer") || isGrabbingPart(hand))
                return;
			
			var pointer = hand.data("pointer");
			
			if(pointer.intersectedObj) {
				pointerSphere.visible = true;
				var percentDistance = pointer.intersectedObj.distance / pointer.hoverDistance;
				var newScale = pointerSphereMaxScale - percentDistance * (pointerSphereMaxScale - pointerSphereMinScale)
				console.log("new pointer sphere scale: " + newScale)
				pointerSphere.scale.set(newScale, newScale, newScale);
				
				pointerSphere.position.copy(pointer.intersectedObj.point);
			}
			else
				pointerSphere.visible = false;

			if(actionMode == null && !isGrabbingPart(hand) && isPinchingOrGrabbing(hand) && pointer.getTouchElement() && pointer.getTouchElement().canGrab)
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
	
	var pointerSphereMinScale = 1;
	var pointerSphereMaxScale = 4;
	var geometry = new THREE.SphereGeometry( 0.01 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	var pointerSphere = new THREE.Mesh( geometry, material );
	scene.object3D.add( pointerSphere );
	
	controller.on("pointerIntersection", function (pointer) {
		pointerSphere.visible = true;
		var percentDistance = pointer.intersectedObj.distance / pointer.hoverDistance;
		var newScale = pointerSphereMaxScale - percentDistance * (pointerSphereMaxScale - pointerSphereMinScale)
		console.log("new pointer sphere scale: " + newScale)
		pointerSphere.scale.set(newScale, newScale, newScale);
		
		pointerSphere.position.copy(pointer.intersectedObj.point);
	})
	.on("pointerIntersectionCleared", function (pointer) {
		pointerSphere.visible = false;
	});

	var isRotating = function (hand) {
		return actionMode == "rotate" && !isGrabbingPart(hand) && isPinchingOrGrabbing(hand);
	}
	var isZooming = function (hand) {
		return actionMode == "zoom" && !isGrabbingPart(hand) && isPinchingOrGrabbing(hand);
	}
	var isPinchingOrGrabbing = function (hand) {
		return hand.data('pinchEvent.pinching') || hand.data('pinchEvent.grabbing');
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
	
	var unselectedColor = "white";
	var unselectedScale = 2;
	var hoveredColor = "yellow";
	var hoveredScale = 2.5;
	var selectedColor = "blue";
	var selectedScale = 3;
	var spaceBetweenButtons = selectedScale;
	var self = this;
	
	this.init = function () {
		var containerEl = $("<a-entity rotation='0 0 180'' position='0 " + -(selectedScale + spaceBetweenButtons) + " 0' visible='false'></a-entity>");
	
		for(var buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
			this.createButton(containerEl, buttonIndex);
		}
		
		$("a-scene").append(containerEl);
		
		Leap.loop({ background: true }, {
			hand: function (hand) {
				if (hand.type != "left")
					return;
					
				if(!hand.data("hasGlobalActions")) {
					var handMesh = hand.data("riggedHand.mesh");
					if(!handMesh)
						return;
						
					handMesh.add(containerEl.get(0).object3D);
						
					hand.data("hasGlobalActions", true)
				}

				var visible = !hand.data('pinchEvent.pinching') && !hand.data('pinchEvent.grabbing');
				containerEl.get(0).setAttribute("visible", visible.toString())
			},
		});
		
		
	}
	
	this.selectedCallback = null;
	this.onSelected = function (callback) {
		this.selectedCallback = callback;
	}
	
	this.createButton = function (containerEl, buttonIndex) {
		var button = buttons[buttonIndex];
		var y = buttonIndex * (selectedScale + spaceBetweenButtons);
		var buttonEl = $("<a-box class='globalAction' position=' 0 " + y + " 0' scale='" + unselectedScale + " " + unselectedScale + " " + unselectedScale + "' src='" + button.src + "' color='white'></a-box>")
		
		containerEl.append(buttonEl);
		
		buttonEl.on("stateadded", function (e) {
			if(e.detail.state == "pointerHovered" && !buttonEl.get(0).selected ) {
				buttonEl.get(0).setAttribute("scale", hoveredScale + " " + hoveredScale + " " + hoveredScale);
				buttonEl.get(0).setAttribute("material", "color", hoveredColor);
			}
		})
		.on("stateremoved", function (e) {
			if(e.detail.state == "pointerHovered" && !buttonEl.get(0).selected) {
				buttonEl.get(0).setAttribute("scale", unselectedScale + " " + unselectedScale + " " + unselectedScale);
				buttonEl.get(0).setAttribute("material", "color", unselectedColor);	
			}
		})
		.on("pointerTouch", function (e) {
			var wasSelected	= buttonEl.get(0).selected;
			$(".globalAction").each(function () {
				$(this).get(0).selected = false;
				$(this).get(0).setAttribute("scale", unselectedScale + " " + unselectedScale + " " + unselectedScale);
				$(this).get(0).setAttribute("material", "color", unselectedColor);
			})
			
			var newAction = null;
			if(!wasSelected) {
				buttonEl.get(0).selected = true;
				buttonEl.get(0).setAttribute("scale", selectedScale + " " + selectedScale + " " + selectedScale);
				buttonEl.get(0).setAttribute("material", "color", selectedColor);
				newAction = button.action;
			}
			
			self.selectedCallback(newAction)		
		})
	}
	
	this.init();
}