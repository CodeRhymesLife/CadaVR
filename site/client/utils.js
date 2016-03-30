Utils = {};

// Get default xyz
Utils.getDefaultXYZ = function (o) {
	return {
		x: 0,
		y: 0,
		z: 0,
	}
}

// Combines xyz properties into a single string
Utils.xyzString = function (o) {
	return o.x + " " + o.y + " " + o.z;
}

Utils.getScaleForMaxDimension = function (obj, maxDimension) {
    var box = new THREE.Box3().setFromObject(obj.object3D);
    //console.log(box.min, box.max, box.size());
    var boxSize = box.size();
    var maxCurrentDimension = Math.max(boxSize.x, Math.max(boxSize.y, boxSize.z));
    var newScale = maxDimension / maxCurrentDimension;
    console.log("scale to resize obj to '" + maxDimension + "'m : " + newScale);
    return newScale;
}

Utils.RotateAroundObjectAxis = function (object, axis, radians) {
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationAxis(axis.normalize(), radians);
    object.object3D.matrix.multiply(rotationMatrix);                       // post-multiply
    object.object3D.rotation.setFromRotationMatrix(object.object3D.matrix, object.object3D.order);
}

Utils.RotateAroundWorldAxis = function (object, axis, radians) {
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.object3D.matrix);        // pre-multiply
    object.object3D.matrix = rotWorldMatrix;
    object.object3D.rotation.setFromRotationMatrix(object.object3D.matrix, object.object3D.order);
}

Utils.showArrowHelper = function (origin, dir, arrowToRemove) {
	var length = 1;
	var hex = 0xffff00;

	if (arrowToRemove)
		Utils.sceneEl.object3D.remove(arrowToRemove)

	var newArrow = new THREE.ArrowHelper(dir, origin, length, hex);
	Utils.sceneEl.object3D.add(newArrow);
	return newArrow;
}

Utils.sceneEl;
Utils.cameraEl;

var callbacks = [];
Utils.waitForScene = function (callback) {
    if (sceneReady)
        callback();
    else
        callbacks.push(callback);
}

var sceneReady = false;
var checkSceneReady = function () {
	var scene = $("a-scene").get(0);
	if( scene == undefined ) {
		setTimeout(checkSceneReady, 10);
		return;
	}

	var execSceneReady = function () {
		sceneReady = true;
		Utils.sceneEl = $("a-scene").get(0);
		Utils.cameraEl = $("a-camera").get(0);
        callbacks.forEach(function (cb) { cb(); });
	}
	
    if (scene.renderStarted)
		execSceneReady();
    else
        scene.addEventListener("renderstart", execSceneReady)
}
checkSceneReady();
