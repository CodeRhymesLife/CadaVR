var colors = {
    artery: "red",
    vein: "blue",
    general: "#ffb3b3",
}
var heartParts = [
    {
        "file": "Anterior Papillary Muscle of Right Ventricle.obj",
        "name": "Anterior Papillary Muscle of Right Ventricle",
        "color": "#ffb3b3",
        "description": "Papillary muscle of right venricle which is attached to the wall of right ventricle below the anteroposterior commissure of tricuspid valve and the septomarginal trabecula. "
    },
    {
        "file": "Circumflex branch of left coronary artery.obj",
        "name": "Circumflex branch of left coronary artery",
        "color": "red",
        "description": "Branch of left coronary artery which runs perpendicular to the anterior interventricular branch of the left coronary artery on the left side of the interventricular sulcus and supplies the left side of the heart. "
    },
    {
        "file": "Coronary sinus.obj",
        "name": "Coronary sinus",
        "color": "#ffb3b3",
        "description": "N/A"
    },
    {
        "file": "Great cardiac vein.obj",
        "name": "Great cardiac vein",
        "color": "blue",
        "description": "N/A"
    },
    {
        "file": "Marginal branch of right coronary artery.obj",
        "name": "Marginal branch of right coronary artery",
        "color": "red",
        "description": "Anterior ventricular branch of right coronary artery which runs downward along the the acute margin and supplies the anterior wall of right ventricle and the apex. "
    },
    {
        "file": "Mitral valve.obj",
        "name": "Mitral valve",
        "color": "#ffb3b3",
        "description": "Atrioventricular valve which has as its parts the anterior and posterior leaflets, attached to the fibrous ring of mitral valve. "
    },
    {
        "file": "Posterior papillary muscle of left ventricle.obj",
        "name": "Posterior papillary muscle of left ventricle",
        "color": "#ffb3b3",
        "description": "Papillary muscle of left ventricle which has as its parts the posteromedial and anterior heads of the posterior papillary muscle of left ventricle and is continuous with the inferior wall of left ventricle.. "
    },
    {
        "file": "Posterior papillary muscle of right ventricle.obj",
        "name": "Posterior papillary muscle of right ventricle",
        "color": "#ffb3b3",
        "description": "Papillary muscle of right ventricle which is attached to the wall of right ventricle below the posteroseptal commissure of tricuspid valve. "
    },
    {
        "file": "Pulmonary valve.obj",
        "name": "Pulmonary valve",
        "color": "#ffb3b3",
        "description": "Cardiac valve which has as its parts the right anterior, left anterior and posterior cusps, attached to the fibrous ring of pulmonary valve. "
    },
    {
        "file": "Right posterolateral branch of right coronary artery.obj",
        "name": "Right posterolateral branch of right coronary artery",
        "color": "red",
        "description": "N/A"
    },
    {
        "file": "Septal papillary muscle of right ventricle.obj",
        "name": "Septal papillary muscle of right ventricle",
        "color": "#ffb3b3",
        "description": "Papillary muscle of right ventricle which is attached to the septomarginal trabecula. "
    },
    {
        "file": "Tricuspid valve.obj",
        "name": "Tricuspid valve",
        "color": "#ffb3b3",
        "description": "Atrioventricular valve which has as its parts the anterior, posterior and septal leaflets, attached to the fibrous ring of tricuspid valve. "
    },
    {
        "file": "Trunk of right coronary artery.obj",
        "name": "Trunk of right coronary artery",
        "color": "red",
        "description": "N/A"
    },
    {
        "file": "Wall of heart.obj",
        "name": "Wall of heart",
        "color": "#ffb3b3",
        "description": "Wall of organ which has as its parts the endocardium, myocardium , epicardium, and the cardiac septum, surrounded by the pericardial sac proper and is continuous with the walls of the systemic and pulmonary arterial and venous trees. "
    }
];

Template.heartLesson.onRendered(function () {
	// Detect when player is looking left and right
	var sceneEl = $("a-scene").get(0)
	var cameraEl = sceneEl.cameraEl;

	setupHeart();
	setupVisuals(cameraEl);
	setupController();
	setupLookEvents(sceneEl, cameraEl);
});

function setupHeart() {
    // Add Heart parts
    heartParts.forEach(function (partInfo) {
        $(".heartContainer").append("<a-model material='color: " + partInfo.color + ";' loader='src: url(models\\heart\\" + partInfo.file + "); format: obj'></a-model>");
    });

    var updateMaterialColor = function (material, newColor) {
        var oldData = material.getData();
        if(material.originalColor == undefined)
            material.originalColor = oldData.color;
        material.data.color = newColor;
        material.update(oldData);
    }
    $("body").on("stateadded", ".heartContainer a-model", function (e) {
        if (e.detail.state == "hovered") {
            updateMaterialColor($(this).get(0).components.material, "yellow");
        }
    })
    $("body").on("stateremoved", ".heartContainer a-model", function (e) {
        if (e.detail.state == "hovered") {
            var material = $(this).get(0).components.material;
            updateMaterialColor(material, material.originalColor);
        }
    })
}

function setupVisuals(cameraEl) {
    // Top
    displayImage(
        "taskHeader",
		"taskCard.png",
		"0 1.95 0",
		"0 26 0",
		0.5,
		1746,
		246
	);
    $(cameraEl).on("lookingUpStart", function () {
        //slideVertical(".taskHeader", -0.8);
    })
    .on("lookingUpEnd", function () {
        //slideVertical(".taskHeader", 0.8);
    });

    // Left
    displayImage(
        "taskDescription",
		"mainCard.png",
		"0 -0.1 0",
		"0 80 0",
		4,
		1674,
		2204
	);
    displayImage(
        "quizIcon taskIcon",
		"quizIcon.png",
		"0 0.9 -0.01",
		"0 40.3 0",
		0.5,
		400,
		400
	);
    displayImage(
        "soundIcon taskIcon",
		"soundIcon.png",
		"0 0.3 -0.01",
		"0 40.3 0",
		0.5,
		400,
		400
	);
    displayImage(
        "simIcon taskIcon",
		"simIcon.png",
		"0 -0.3 -0.01",
		"0 40.3 0",
		0.5,
		400,
		400
	);
    $(cameraEl).on("lookingLeftStart", function () {
        //slideHorizontal(".taskDescription, .taskIcon", -20);
    })
    .on("lookingLeftEnd", function () {
        //slideHorizontal(".taskDescription, .taskIcon", 20);
    });

    // Right
    displayImage(
        "bodyImage",
		"body.png",
		"0 0 0",
		"0 -30 0",
		3.8,
		1418,
		2960
	);
    $(cameraEl).on("lookingRightStart", function () {
        //slideHorizontal(".bodyImage", 20);
    })
    .on("lookingRightEnd", function () {
        //slideHorizontal(".bodyImage", -20);
    });
}

function setupController() {
    var controller = LeapUtils.createController();

    var organContainer = $(".heartContainer").get(0);
    var rotate = null;
    var zoom = false;
    var leftHandPinched = false;
    var rightHandPinched = false;
    controller.on('grab', function (hand) {
        rotate = hand;
    })
    .on('ungrab', function (hand) {
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

function setupLookEvents(sceneEl, cameraEl) {
    sceneEl.addBehavior({
        lookingLeft: false,
        lookingRight: false,
        lookingUp: false,
        lookingDown: false,
        lastCameraRotation: cameraEl.getAttribute("rotation"),
        leftThreshold: 40,
        rightThreshold: -40,
        upThreshold: 7,
        downThreshold: -60,
        update: function () {
            var rotation = cameraEl.getAttribute("rotation");

            // Left
            if (!this.lookingLeft && rotation.y > this.leftThreshold) {
                this.lookingLeft = true;
                cameraEl.emit("lookingLeftStart");
            }
            else if (this.lookingLeft && rotation.y < this.leftThreshold) {
                this.lookingLeft = false;
                cameraEl.emit("lookingLeftEnd");
            }

            // Right
            if (!this.lookingRight && rotation.y < this.rightThreshold) {
                this.lookingRight = true;
                cameraEl.emit("lookingRightStart");
            }
            else if (this.lookingRight && rotation.y > this.rightThreshold) {
                this.lookingRight = false;
                cameraEl.emit("lookingRightEnd");
            }

            // Up
            if (!this.lookingUp && rotation.x > this.upThreshold) {
                this.lookingUp = true;
                cameraEl.emit("lookingUpStart");
            }
            else if (this.lookingUp && rotation.x < this.upThreshold) {
                this.lookingUp = false;
                cameraEl.emit("lookingUpEnd");
            }

            // Down
            if (!this.lookingDown && rotation.x < this.downThreshold) {
                this.lookingDown = true;
                cameraEl.emit("lookingDownStart");
            }
            else if (this.lookingDown && rotation.x > this.downThreshold) {
                this.lookingDown = false;
                cameraEl.emit("lookingDownEnd");
            }

            this.lastCameraRotation = rotation;
        },
    });
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

function displayImage(className, src, position, rotation, height, actualImageWidth, actualImageHeight) {
	var radius = 4;
	thetaLength = 57.2958 * actualImageWidth * height /
					(actualImageHeight * radius);
	
    $(".curvedBackgroundContainer").append("<a-curvedimage class='" + className + "' " +
        "src='images/heartLesson/" + src + "' " +
		"position='" + position + "' " +
		"rotation='" + rotation + "' " +
		"height='" + height + "' " +
		"radius='" + radius + "' " +
		"theta-length='" + thetaLength + "' " +
		"data-actualImageWidth='" + actualImageWidth + "' " +
		"data-actualImageHeight='" + actualImageHeight + "'></a-curvedimage>");
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