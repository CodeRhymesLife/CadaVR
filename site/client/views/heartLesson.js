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
	
	heartParts.forEach(function (partInfo) {
		$(".heartContainer").append("<a-model material='color: #FFF0F5;' loader='src: url(models\\heart\\" + partInfo.file + "); format: obj'></a-model>");
	})
	
	displayImage(
		"mainCard.png",
		"0 -0.1 0",
		"0 100 0",
		4,
		1674,
		2204
	);
	
	displayImage(
		"taskCard.png",
		"0 1.95 0",
		"0 28 0",
		0.5,
		1746,
		246
	);

	displayImage(
		"quizIcon.png",
		"0 0.9 -0.01",
		"0 60.3 0",
		0.5,
		400,
		400
	);

	displayImage(
		"soundIcon.png",
		"0 0.3 -0.01",
		"0 60.3 0",
		0.5,
		400,
		400
	);
	
	displayImage(
		"simIcon.png",
		"0 -0.3 -0.01",
		"0 60.3 0",
		0.5,
		400,
		400
	);

	displayImage(
		"body.png",
		"0 0 0",
		"0 -45 0",
		3.8,
		1418,
		2960
	);
});

function displayImage(src, position, rotation, height, actualImageWidth, actualImageHeight) {
	var radius = 4;
	thetaLength = 57.2958 * actualImageWidth * height /
					(actualImageHeight * radius);
	
	$(".curvedBackgroundContainer").append("<a-curvedimage src='images/heartLesson/" + src + "' " +
		"position='" + position + "' " +
		"rotation='" + rotation + "' " +
		"height='" + height + "' " +
		"radius='" + radius + "' " +
		"theta-length='" + thetaLength + "'></a-curvedimage>");
}