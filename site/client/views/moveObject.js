Template.moveObject.onRendered(function () {
	var dragging;
	var scene = $("a-scene").get(0)
	var camera = $("a-scene").get(0).cameraEl;

    $(".moveableObject").mousedown(function (e) {
		dragging = $( this ).get(0);

		// Get the offset between the object and the camera
		var offset = new THREE.Vector3().copy(camera.getAttribute("position")).sub(dragging.getAttribute("position"));
		
		// Add the object as a child of the camera so it follows the camera
        camera.add(dragging);
		
		// Move the object dirrectly in front of the camera
		dragging.setAttribute("position", {x: 0, y: 0, z: -offset.z})
    });
	
	$(".moveableObject").mouseup(function (e) {
		if(dragging == null || dragging != $( this ).get(0))
			return;
		
		camera.object3D.updateMatrixWorld();
		THREE.SceneUtils.detach( dragging.object3D, camera.object3D, scene.object3D );
		dragging = null;
    });
});