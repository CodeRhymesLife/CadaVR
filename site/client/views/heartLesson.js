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
	var controller = LeapUtils.createController();

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
});


function setupVisuals(cameraEl) {
    // Add Heart parts
    heartParts.forEach(function (partInfo) {
        $(".heartContainer").append("<a-model material='color: #FFF0F5;' loader='src: url(models\\heart\\" + partInfo.file + "); format: obj'></a-model>");
    });

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
        "taskHeader",
		"taskCard.png",
		"0 1.95 0",
		"0 26 0",
		0.5,
		1746,
		246
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

    displayImage(
        "bodyImage",
		"body.png",
		"0 0 0",
		"0 -50 0",
		3.8,
		1418,
		2960
	);

    $(cameraEl).on("lookingLeftStart", function () {
        slide(".taskDescription, .taskIcon", "horizontal", -20);
    })
    .on("lookingLeftEnd", function () {
        slide(".taskDescription, .taskIcon", "horizontal", 20);
    })
    .on("lookingRightStart", function () {
        slide(".bodyImage", "horizontal", 20);
    })
    .on("lookingRightEnd", function () {
        slide(".bodyImage", "horizontal", -20);
    })
    .on("lookingUpStart", function () {
        slide(".taskHeader", "vertical", -0.8);
    })
    .on("lookingUpEnd", function () {
        slide(".taskHeader", "vertical", 0.8);
    })
}

function slide(selector, direction, amount) {
    $(selector).each(function (item) {
        element = $(this).get(0);

        if (direction == "horizontal") {
            rotation = element.getAttribute("rotation");
            rotation.y += amount
            element.setAttribute("rotation", rotation.x + " " + rotation.y + " " + rotation.z);
        }
        else if (direction == "vertical") {
            position = element.getAttribute("position");
            position.y += amount
            element.setAttribute("position", position.x + " " + position.y + " " + position.z);
        }
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