Template.neckLesson.onRendered(function () {
	$(".leftarrow").click( function () {
		rotateBody(-30)
	});

	$(".rightarrow").click( function () {
		rotateBody(30)
	});
});

function rotateBody(amount) {
	var bodyElement = $(".human").get(0);
	var rotation = bodyElement.getAttribute("rotation") || { x: 0, y: 0, z: 0 };
	rotation.y -= amount;
	bodyElement.setAttribute("rotation",
		String(rotation.x) + " " +
		String(rotation.y) + " " +
		String(rotation.z));
}