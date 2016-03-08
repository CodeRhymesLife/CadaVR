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