Template.moveObject.onRendered(function () {
	var dragging;
	var scene = $("a-scene").get(0)
	var camera = $("a-scene").get(0).cameraEl;

    $(".moveableObject").mousedown(function (e) {
		if(dragging != null)
			return;

		dragging = $( this ).get(0);

		dragging.object3D.parent.updateMatrixWorld();
		THREE.SceneUtils.attach( dragging.object3D, scene.object3D, camera.object3D );
    });
	
	$(".moveableObject").mouseup(function (e) {
		if(dragging == null || dragging != $( this ).get(0))
			return;

		dragging.object3D.parent.updateMatrixWorld();
		THREE.SceneUtils.detach( dragging.object3D, dragging.object3D.parent, scene.object3D );
		dragging = null;
    });
});