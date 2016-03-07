DisplayUtils = {};

DisplayUtils.addImageToCurvedBackgroundContainer = function (className, src, position, rotation, height, actualImageWidth, actualImageHeight) {
	var radius = 4;
	thetaLength = 57.2958 * actualImageWidth * height /
					(actualImageHeight * radius);
	
	var rotationParts = rotation.split(" ");
	var slideRotation = rotationParts[0] + " " + (rotationParts[1] - 5) + " " + rotationParts[2];
	
    $(".curvedBackgroundContainer").append("<a-curvedimage class='" + className + "' " +
        "src='images/heartLesson/" + src + "' " +
		"position='" + position + "' " +
		"rotation='" + rotation + "' " +
		"height='" + height + "' " +
		"radius='" + radius + "' " +
		"theta-length='" + thetaLength + "' " +
		"data-actualImageWidth='" + actualImageWidth + "' " +
		"data-actualImageHeight='" + actualImageHeight + "'>" +
			"<a-animation " +
				"begin='slideRight' " +
				"attribute='rotation' " +
				"to='" + slideRotation + "' " +
				"dur='500' " +
				"fill='forwards' " +
				"></a-animation>" +
			"<a-animation " +
				"begin='slideLeft' " +
				"attribute='rotation' " +
				"to='" + rotation + "' " +
				"dur='500' " +
				"fill='forwards' " +
				"></a-animation>" +
		"</a-curvedimage>");
}
