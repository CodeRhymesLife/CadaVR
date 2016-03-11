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

var callbacks = [];
Utils.waitForScene = function (callback) {
    if (sceneReady)
        callback();
    else
        callbacks.push(callback);
}

var sceneReady = false;
var checkSceneReady = function () {
    if ($("a-scene").get(0) != undefined && $("a-scene").get(0).cameraEl != undefined) {
        sceneReady = true;
        callbacks.forEach(function (cb) { cb(); });
    }
    else
        setTimeout(checkSceneReady, 10);
}
checkSceneReady();
