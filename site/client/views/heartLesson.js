var heartParts = [
	{
		"file": "Anterior Papillary Muscle of Right Ventricle.obj",
		"name": "Anterior Papillary Muscle of Right Ventricle"
	},
	{
		"file": "Circumflex branch of left coronary artery.obj",
		"name": "Circumflex branch of left coronary artery"
	},
	{
		"file": "Coronary sinus.obj",
		"name": "Coronary sinus"
	},
	{
		"file": "Great cardiac vein.obj",
		"name": "Great cardiac vein"
	},
	{
		"file": "Marginal branch of right coronary artery.obj",
		"name": "Marginal branch of right coronary artery"
	},
	{
		"file": "Mitral valve.obj",
		"name": "Mitral valve"
	},
	{
		"file": "Posterior papillary muscle of left ventricle.obj",
		"name": "Posterior papillary muscle of left ventricle"
	},
	{
		"file": "Posterior papillary muscle of right ventricle.obj",
		"name": "Posterior papillary muscle of right ventricle"
	},
	{
		"file": "Pulmonary valve.obj",
		"name": "Pulmonary valve"
	},
	{
		"file": "Right posterolateral branch of right coronary artery.obj",
		"name": "Right posterolateral branch of right coronary artery"
	},
	{
		"file": "Septal papillary muscle of right ventricle.obj",
		"name": "Septal papillary muscle of right ventricle"
	},
	{
		"file": "Tricuspid valve.obj",
		"name": "Tricuspid valve"
	},
	{
		"file": "Trunk of right coronary artery.obj",
		"name": "Trunk of right coronary artery"
	},
	{
		"file": "Wall of heart.obj",
		"name": "Wall of heart"
	}
];
Template.heartLesson.onRendered(function () {
	// Detect when player is looking left and right
	var sceneEl = $("a-scene").get(0)
	var cameraEl = sceneEl.cameraEl;
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

	setupVisuals(cameraEl);
	setupController();
});


function setupVisuals(cameraEl) {
    // Add Heart parts
    heartParts.forEach(function (partInfo) {
        $(".heartContainer").append("<a-model material='color: #FFF0F5;' loader='src: url(models\\heart\\" + partInfo.file + "); format: obj'></a-model>");
    });

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
        slideVertical(".taskHeader", -0.8);
    })
    .on("lookingUpEnd", function () {
        slideVertical(".taskHeader", 0.8);
    });

    // Left
    displayImage(
        "taskDescription",
		"mainCard.png",
		"0 -0.1 0",
		"0 100 0",
		4,
		1674,
		2204
	);
    displayImage(
        "quizIcon taskIcon",
		"quizIcon.png",
		"0 0.9 -0.01",
		"0 60.3 0",
		0.5,
		400,
		400
	);
    displayImage(
        "soundIcon taskIcon",
		"soundIcon.png",
		"0 0.3 -0.01",
		"0 60.3 0",
		0.5,
		400,
		400
	);
    displayImage(
        "simIcon taskIcon",
		"simIcon.png",
		"0 -0.3 -0.01",
		"0 60.3 0",
		0.5,
		400,
		400
	);
    $(cameraEl).on("lookingLeftStart", function () {
        slideHorizontal(".taskDescription, .taskIcon", -20);
    })
    .on("lookingLeftEnd", function () {
        slideHorizontal(".taskDescription, .taskIcon", 20);
    });

    // Right
    displayImage(
        "bodyImage",
		"body.png",
		"0 0 0",
		"0 -50 0",
		3.8,
		1418,
		2960
	);
    $(cameraEl).on("lookingRightStart", function () {
        slideHorizontal(".bodyImage", 20);
    })
    .on("lookingRightEnd", function () {
        slideHorizontal(".bodyImage", -20);
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
		"theta-length='" + thetaLength + "'></a-curvedimage>");
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