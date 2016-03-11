var colors = {
    artery: "#DD0000",
    vein: "#336699",
    general: "#ff8181",
}
var heartParts = [
    {
        "file": "Anterior Papillary Muscle of Right Ventricle.obj",
        "name": "Anterior Papillary Muscle of Right Ventricle",
        "color": colors.general,
        "description": "Papillary muscle of right venricle which is attached to the wall of right ventricle below the anteroposterior commissure of tricuspid valve and the septomarginal trabecula. "
    },
    {
        "file": "Circumflex branch of left coronary artery.obj",
        "name": "Circumflex branch of left coronary artery",
        "color": colors.artery,
        "description": "Branch of left coronary artery which runs perpendicular to the anterior interventricular branch of the left coronary artery on the left side of the interventricular sulcus and supplies the left side of the heart. "
    },
    {
        "file": "Coronary sinus.obj",
        "name": "Coronary sinus",
        "color": colors.vein,
        "description": "N/A"
    },
    {
        "file": "Great cardiac vein.obj",
        "name": "Great cardiac vein",
        "color": colors.vein,
        "description": "N/A"
    },
    {
        "file": "Marginal branch of right coronary artery.obj",
        "name": "Marginal branch of right coronary artery",
        "color": colors.artery,
        "description": "Anterior ventricular branch of right coronary artery which runs downward along the the acute margin and supplies the anterior wall of right ventricle and the apex. "
    },
    {
        "file": "Mitral valve.obj",
        "name": "Mitral valve",
        "color": colors.general,
        "description": "Atrioventricular valve which has as its parts the anterior and posterior leaflets, attached to the fibrous ring of mitral valve. "
    },
    {
        "file": "Posterior papillary muscle of left ventricle.obj",
        "name": "Posterior papillary muscle of left ventricle",
        "color": colors.general,
        "description": "Papillary muscle of left ventricle which has as its parts the posteromedial and anterior heads of the posterior papillary muscle of left ventricle and is continuous with the inferior wall of left ventricle.. "
    },
    {
        "file": "Posterior papillary muscle of right ventricle.obj",
        "name": "Posterior papillary muscle of right ventricle",
        "color": colors.general,
        "description": "Papillary muscle of right ventricle which is attached to the wall of right ventricle below the posteroseptal commissure of tricuspid valve. "
    },
    {
        "file": "Pulmonary valve.obj",
        "name": "Pulmonary valve",
        "color": colors.general,
        "description": "Cardiac valve which has as its parts the right anterior, left anterior and posterior cusps, attached to the fibrous ring of pulmonary valve. "
    },
    {
        "file": "Right posterolateral branch of right coronary artery.obj",
        "name": "Right posterolateral branch of right coronary artery",
        "color": colors.artery,
        "description": "N/A"
    },
    {
        "file": "Septal papillary muscle of right ventricle.obj",
        "name": "Septal papillary muscle of right ventricle",
        "color": colors.general,
        "description": "Papillary muscle of right ventricle which is attached to the septomarginal trabecula. "
    },
    {
        "file": "Tricuspid valve.obj",
        "name": "Tricuspid valve",
        "color": colors.general,
        "description": "Atrioventricular valve which has as its parts the anterior, posterior and septal leaflets, attached to the fibrous ring of tricuspid valve. "
    },
    {
        "file": "Trunk of right coronary artery.obj",
        "name": "Trunk of right coronary artery",
        "color": colors.artery,
        "description": "N/A"
    },
    {
        "file": "Wall of heart.obj",
        "name": "Wall of heart",
        "color": colors.general,
        "description": "Wall of organ which has as its parts the endocardium, myocardium , epicardium, and the cardiac septum, surrounded by the pericardial sac proper and is continuous with the walls of the systemic and pulmonary arterial and venous trees. "
    }
];

var rotate;
var zoom;
var rotateEnd = Date.now();
var zoomEnd = Date.now();

Template.heartLesson.onRendered(function () {
    Utils.waitForScene(function () {
        // Detect when player is looking left and right
        var sceneEl = $("a-scene").get(0)
        var cameraEl = sceneEl.cameraEl;

        setupHeart();
        setupVisuals(cameraEl);
        setupController();
        CameraUtils.setupLookEvents();
        setupHUD(sceneEl);
    });
});

function setupHeart() {
    // Add Heart parts
    heartParts.forEach(function (partInfo) {
        var part = $("<a-model material='color: " + partInfo.color + ";' loader='src: url(models\\heart\\" + partInfo.file + "); format: obj'></a-model>");
        partInfo.organNameElement = $('<a-entity class="organName" visible="false" text="text: ' + partInfo.name + '" scale="0.04 0.04 0.04" material="color: black" width="1" height="0.5"></a-entity>')
		part.data("partInfo", partInfo);
		$(".heartContainer").append(part)
        $(".organNames").append(partInfo.organNameElement)
    });

    var selectedPartElement = null;
    var highlightedPartElement = null;
    var highlightColor = "#F9E400";

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
        $("body .heartContainer a-model").each(function (i, otherPart) {
            var otherPartElement = $(otherPart).get(0);
            if (otherPartElement != selectedPartElement)
                otherPartElement.setAttribute("material", "opacity", "0.1")
        })
    }

    var deselectPart = function () {
        $("body .heartContainer a-model").each(function (i, part) {
            var partElement = $(this).get(0);
            partElement.setAttribute("material", "opacity", "1")
        })
        selectedPartElement = null;
    }

    $(".heartContainer a-model").on("stateadded", function (e) {
        if (selectedPartElement)
            return;
            
        setHighlightColor(this);
		
		// Update the HUD
        var organNameElement = $(highlightedPartElement).data("partInfo").organNameElement.get(0);
        updateHUDOrganName(organNameElement)
        organNameElement.setAttribute("visible", "true");
    })
    $(".heartContainer a-model").on("stateremoved", function (e) {
        if (selectedPartElement)
            return;

        $(this).data("partInfo").organNameElement.get(0).setAttribute("visible", "false");
        removeHighlightColor(this);
    })

    var lastCall = 0;
    $(".heartContainer a-model").on("click", function (e) {
        if(zoom || rotate)
            return;
        
        var timeSinceLastAction = Date.now() - Math.max(zoomEnd, rotateEnd);
        console.log("time since last action: " + timeSinceLastAction)
        if (timeSinceLastAction < 500)
            return;
            
        // For some reason the click event is executed twice.
        // Make sure a half second passes before we call it again
        if (new Date() - lastCall < 500)
            return;
        lastCall = new Date();

        // If a part is selected deselect it
        if (selectedPartElement) {
            $(selectedPartElement).data("partInfo").organNameElement.get(0).setAttribute("visible", "false");
            deselectPart();
            hideDescription();
        }
        else {
            selectPart(this);
            showDescription(selectedPartElement)
        }
    })
}

function setupVisuals(cameraEl) {
    // Top
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "taskHeader",
		"images/heartLesson/taskCard.png",
		"0 1.95 0",
		"0 26 0",
		0.5,
		1746,
		246
	);

    // Left
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "taskDescription",
		"images/heartLesson/mainCard.png",
		"0 -0.1 0",
		"0 80 0",
		4,
		1674,
		2204
	);
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "quizIcon taskIcon",
		"images/heartLesson/quizIcon.png",
		"0 0.9 -0.01",
		"0 40.3 0",
		0.5,
		400,
		400
	);
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "soundIcon taskIcon",
		"images/heartLesson/soundIcon.png",
		"0 0.3 -0.01",
		"0 40.3 0",
		0.5,
		400,
		400
	);
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "simIcon taskIcon",
		"images/heartLesson/simIcon.png",
		"0 -0.3 -0.01",
		"0 40.3 0",
		0.5,
		400,
		400
	);
    $(cameraEl).on("lookingLeftStart", function () {
        $(".taskIcon").each(function () {
			$(this).get(0).emit("slideRight");
		});
    })
    .on("lookingLeftEnd", function () {
		$(".taskIcon").each(function () {
			$(this).get(0).emit("slideLeft");
		});
    });

    // Right
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "bodyImage",
		"images/heartLesson/body.png",
		"0 0 0",
		"0 -30 0",
		3.8,
		1418,
		2960
	);
}

function setupController() {
    var controller = LeapUtils.createController();

    var organContainer = $(".heartContainer").get(0);
    var leftHandPinched = false;
    var rightHandPinched = false;
    controller.on('grab', function (hand) {
        rotate = hand;
    })
    .on('ungrab', function (hand) {
        if(rotate)
            rotateEnd = Date.now();
        rotate = null;
    })
    .on('pinch', function (hand) {
        if (hand.type == "right")
            rightHandPinched = true;
        if (hand.type == "left")
            leftHandPinched = true;

        zoom = rightHandPinched && leftHandPinched;
    })
    .on('unpinch', function (hand) {
        if (hand.type == "right")
            rightHandPinched = false;
        if (hand.type == "left")
            leftHandPinched = false;

         if(zoom)
            zoomEnd = Date.now();

        zoom = false;
    })
    .on("handMoved", function (hand) {
        if (rotate) {
            var lastHand = controller.frame(1).hand(hand.id);
            var currentHand = controller.frame(0).hand(hand.id);

            var deltaPosition = {
                x: currentHand.palmPosition[0] - lastHand.palmPosition[0],
                y: currentHand.palmPosition[1] - lastHand.palmPosition[1],
            };

            var rotationFactor = 1000;
            var rotation = organContainer.getAttribute("rotation") || { x: 0, y: 0, z: 0 };
            rotation.x -= deltaPosition.y * rotationFactor;
            rotation.y += deltaPosition.x * rotationFactor;
            organContainer.setAttribute("rotation",
                String(rotation.x) + " " +
                String(rotation.y) + " " +
                String(rotation.z));
        }

        if (zoom && validHands()) {
            var scale = organContainer.object3D.scale;
            var scaleFactor = 1 + (getDistanceBetweenHands(0) - getDistanceBetweenHands(1))
            scaleFactor = Math.max(0.0000001, scaleFactor);
            console.log("Scale factor: " + scaleFactor);
            scale.x *= scaleFactor;
            scale.y *= scaleFactor;
            scale.z *= scaleFactor;
            organContainer.setAttribute("scale", scale.x + " " + scale.y + " " + scale.z)
        }
    });
}

function setupHUD(sceneEl) {
	var hud = $(".hud").get(0);
	hud.object3D.parent.updateMatrixWorld();
	THREE.SceneUtils.attach( hud.object3D, sceneEl.object3D, sceneEl.cameraEl.object3D );
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

function slideHorizontal(selector, amount) {
    $(selector).each(function (item) {
        element = $(this).get(0);
        rotation = element.getAttribute("rotation");
        rotation.y += amount
        element.setAttribute("rotation", rotation.x + " " + rotation.y + " " + rotation.z);
    })
}

function slideVertical(selector, amount) {
    $(selector).each(function (item) {
        element = $(this).get(0);
        position = element.getAttribute("position");
        position.y += amount
        element.setAttribute("position", position.x + " " + position.y + " " + position.z);
    })
}

function validHands() {
    return controller.frame(0).hands.length == 2 &&
        controller.frame(0).hands[0].valid &&
        controller.frame(0).hands[1].valid
}

function getDistanceBetweenHands(frameNumber) {
    var handOne = controller.frame(frameNumber).hands[0];
    var handTwo = controller.frame(frameNumber).hands[1];

    return Math.abs(Leap.vec3.distance(handOne.palmPosition, handTwo.palmPosition));
}