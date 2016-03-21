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

Utils.resize = function (obj, maxDimension) {
	console.log("resizing obj to max '" + maxDimension + "' meter");
	var box = new THREE.Box3().setFromObject(obj.object3D);
	//console.log(box.min, box.max, box.size());
	var boxSize = box.size();
	var maxCurrentDimension = Math.max( boxSize.x, Math.max( boxSize.y, boxSize.z ) );
	var newScale = maxDimension / maxCurrentDimension;
	obj.setAttribute("scale", newScale + " " + newScale + " " + newScale)
}

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
        callbacks.forEach(function (cb) { cb(); });
	}
	
    if (scene.renderStarted)
		execSceneReady();
    else
        scene.addEventListener("renderstart", execSceneReady)
}
checkSceneReady();
