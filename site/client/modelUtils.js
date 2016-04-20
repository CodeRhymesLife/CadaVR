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
            e.originalEvent.detail.model.traverse(function (child) {
                child.el = e.target
            });

            // When all the models are loaded, scale them and fire a models loaded event
            if (++loadedCount == partsInfo.parts.length) {
                var scale = Utils.getScaleForMaxDimension($(modelContainerSelector).get(0), maxDimension)
                $(modelSelector).each(function () {
                    $(this).get(0).setAttribute("scale", scale + " " + scale + " " + scale)
                    $(this).get(0).originalScale = scale;
                    
                    // Right hand grabs parts
                    TouchInfo.rightHand.add( $(this).get(0).object3D.getObjectByProperty("type", "Mesh"), function (mesh) {
                        return mesh.el.object3D;
                    })
                    
                    // Left hand grabs the whole organ
                    TouchInfo.leftHand.add( $(this).get(0).object3D.getObjectByProperty("type", "Mesh"), function (mesh) {
                        return $(modelContainerSelector).get(0).object3D;
                    } )
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

		var newColor = Utils.blendColors(element.originalColor, "#FFFFFF", 0.5);
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

    //controller.use("pointer", { debug: false });
    $(modelSelector).on("stateadded", function (e) {
        if (actionMode != null || data.selectedPartElement || e.originalEvent.detail.state != "pointerHovered")
            return;
            
        setHighlightColor($(this).get(0));
    })
    $(modelSelector).on("stateremoved", function (e) {
        if (actionMode != null || data.selectedPartElement || e.originalEvent.detail.state != "pointerHovered")
            return;

        removeHighlightColor();
    })

    var canTouch = function (hand) {
        return !isGrabbingPart(hand) && !isRotating(hand) && !isZooming(hand);
    }
    $(modelSelector).on("pointerTouch", function (e) {
        if (actionMode != null || !canTouch(e.originalEvent.detail.pointer.hand))
            return;

        // If a part is selected deselect it
        if (data.selectedPartElement) {
            deselectPart();
        }
        else {
            selectPart(this);
        }
    })
    
    controller.use("rigged-hand-touch", { leftHand: true, rightHand: true, debug: false });
	
    var actionMode = null;
	//var globalActions = new GlobalActionsMenu();
	//globalActions.onSelected(function (action) {
	//	actionMode = action;
	//})

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
			if(e.originalEvent.detail.state == "pointerHovered" && !buttonEl.get(0).selected ) {
				buttonEl.get(0).setAttribute("scale", hoveredScale + " " + hoveredScale + " " + hoveredScale);
				buttonEl.get(0).setAttribute("material", "color", hoveredColor);
			}
		})
		.on("stateremoved", function (e) {
			if(e.originalEvent.detail.state == "pointerHovered" && !buttonEl.get(0).selected) {
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