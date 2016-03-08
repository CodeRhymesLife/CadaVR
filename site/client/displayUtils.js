DisplayUtils = {};

DisplayUtils.addImageToCurvedBackgroundContainer = function (className, src, position, rotation, height, actualImageWidth, actualImageHeight) {
	DisplayUtils.addCurvedImageToContainer("curvedBackgroundContainer", className, src, position, rotation, height, actualImageWidth, actualImageHeight)
}

DisplayUtils.addCurvedImageToContainer = function (containerClassName, className, src, position, rotation, height, actualImageWidth, actualImageHeight) {
	var radius = 4;
	thetaLength = 57.2958 * actualImageWidth * height /
					(actualImageHeight * radius);
	
	var rotationParts = rotation.split(" ");
	var slideRotation = rotationParts[0] + " " + (rotationParts[1] - 5) + " " + rotationParts[2];
	
	var containerSelector = "." + containerClassName;
	if(!$(containerSelector).length) {
		$(".curvedBackgroundContainer").append('<a-entity class="' + containerClassName + '"></a-entity>')
	}
	
    $(containerSelector).append("<a-curvedimage class='" + className + "' " +
        "src='" + src + "' " +
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
