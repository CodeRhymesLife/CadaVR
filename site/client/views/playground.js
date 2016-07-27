var colors = {
    artery: "#DD0000",
    vein: "#336699",
    general: "#ff8181",
}
var heartPartsInfo = {
    folder: "models/realCases/surgeon_heart/",
    parts: [
        {
            "file": "left atrium.obj",
            "name": "Left Atrium",
            "color": colors.general,
            "description": "Left atrium"
        },
        {
            "file": "right atrium and pulmonary artery.obj",
            "name": "Right atrium and pulmonary artery",
            "color": colors.artery,
            "description": "right atrium and pulmonary artery"
        },
        {
            "file": "ventricle.obj",
            "name": "Ventricle",
            "color": colors.vein,
            "description": "N/A"
        },
    ],
};

Template.playground.onRendered(function () {
    Utils.waitForScene(function () {
        // Detect when player is looking left and right
        var sceneEl = $("a-scene").get(0)
        var cameraEl = sceneEl.camera.el;

        var controller = LeapUtils.createController();

        setupHeart(controller);
        setupHUD(sceneEl);
        
        setupTouchEvents();

        setupTrash(controller)
    });
});

function setupHeart(controller) {
    var modelData = ModelUtils.load(heartPartsInfo, ".heartContainer", controller, 0.2);

    // Add Heart parts
    heartPartsInfo.parts.forEach(function (partInfo) {
        partInfo.organNameElement = $('<a-entity class="organName" visible="false" text="text: ' + partInfo.name + '" scale="0.05 0.05 0.05" material="color: black" width="1" height="0.5"></a-entity>')
        $(".organNames").append(partInfo.organNameElement)
    });

    $(".heartContainer .model")
    .on("stateadded", function (e) {
        if (modelData.selectedPartElement == null && e.originalEvent.detail.state == "pointerHovered") {
            // Update the HUD
            var organNameElement = $(modelData.highlightedPartElement).data("partInfo").organNameElement.get(0);
            updateHUDOrganName(organNameElement)
            organNameElement.setAttribute("visible", "true");
        }
        else if (e.originalEvent.detail.state == "selected")
            showDescription(modelData.selectedPartElement)
        else if (e.originalEvent.detail.state == "trashed")
            $(this).data("partInfo").organNameElement.get(0).setAttribute("visible", "false");
    })
    .on("stateremoved", function (e) {
        if (modelData.selectedPartElement == null && e.originalEvent.detail.state == "pointerHovered") 
            $(this).data("partInfo").organNameElement.get(0).setAttribute("visible", "false");
        else if(e.originalEvent.detail.state == "selected")
            hideDescription();
    })
}

function setupHUD(sceneEl) {
	var hud = $(".hud").get(0);
	hud.object3D.parent.updateMatrixWorld();
	THREE.SceneUtils.attach( hud.object3D, sceneEl.object3D, sceneEl.camera.el.object3D );
}

function setupThePin() {
    var pin = new Pin(false);
    
    // For some reason Firefox doesnt go from html -> threejs quick enough
    // so we need to delay initializing the pin
    setTimeout(function () {
        pin.init();
        pin.rootEl.setAttribute("position", "0 1.8 -1");
        pin.rootEl.setAttribute("rotation", "0 0 -90");
        
        $(pin.rootEl).on("stateadded", function (e) {
            if(e.originalEvent.detail.state != "hand.grabbing")
                return;

            pin.enable();
        });
        
        $(pin.rootEl).on("stateremoved", function (e) {
            if(e.originalEvent.detail.state != "hand.grabbing")
                return;

            pin.disable();
        });
        
        TouchInfo.rightHand.add( pin.rootEl.object3D );
        TouchInfo.leftHand.add( pin.rootEl.object3D );
    }, 500)
    
    
    return pin;
}

function setupTouchEvents(pin) {
    controller.use("leap-motion-hand-grabbing", { leftHand: true, rightHand: true, debug: false });
    controller.use("leap-motion-hand-resizing");
    
    $(".heartContainer .model").on("model-loaded", function (e) {
        // Right hand grabs parts
        TouchInfo.rightHand.add( $(this).get(0).object3D,
            function (mesh, part) {
                if(TouchInfo.leftHand.toucherHand.isGrabbing()) {
                    var parent = part.parent;
                    while(parent && parent != TouchInfo.leftHand.toucherHand.grabbedObj)
                        parent = parent.parent;
                        
                    if(parent)
                        return TouchInfo.leftHand.toucherHand.grabbedObj;
                }
                
                return part;
            } );
        
        // Left hand can grab the whole organ
        TouchInfo.leftHand.add( $(this).get(0).object3D, function (mesh, part) {
            
            var container = $(".heartContainer").get(0).object3D;
            var parent = part.parent;
            while(parent && parent != container)
                parent = parent.parent;
        
            // If we walked all the way up the tree and didn't find the container, grab the box
            if(!parent)
                return part;
        
            return container;
        })
    });
}

function setupTrash(controller) {
    var trash = new Trash($(".trash").get(0), false);
    controller.on("hand.grabbing.start", function (toucherHand) {
        trash.enable();
    });
    
    controller.on("hand.grabbing.end", function (toucherHand) {
        trash.disable();
    });
}

function updateHUDOrganName (textObject) {
    if(textObject.positionSet)
        return;
        
	// Center the text
	var box = new THREE.Box3().setFromObject(textObject.object3D);
	//console.log(box.min, box.max, box.size());
	textObject.setAttribute("position", -(box.size().x / 2) + " 0 0");
    textObject.positionSet = true;
}

function hideDescription() {
    $(".partDescription").get(0).setAttribute("visible", "false");
}

function showDescription(selectedPartElement) {
    var description = $(".partDescription").get(0);
    description.setAttribute("visible", "true");
}