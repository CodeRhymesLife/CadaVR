// this should get a new name, now that it includes grabEvent.
Leap.plugin('pointer', function(scope){

	this.use('handHold');
  	//this.use('pinchEvent');
	
	var controller = this;


    var scene = $("a-scene").get(0);

    var detectCollision = false;
    setInterval(function () { detectCollision = true }, 100);

    Leap.loop(function (frame) {
        if (!detectCollision || frame.hands.length <= 0)
            return;

        frame.hands.forEach(function (hand) {
            var handMesh = hand.data("riggedHand.mesh");
            if (!handMesh)
                return;

            var indexFinger = handMesh.fingers[1];

            // Get the finder's position
            var worldPosition = new THREE.Vector3();
            scene.object3D.updateMatrixWorld();
            worldPosition.setFromMatrixPosition(indexFinger.tip.matrixWorld);

            // Get the direction
            var worldDirection = indexFinger.worldDirection;

            // Show the debug arrow?
            if (scope.debug)
                showArrowHelper(worldDirection, worldPosition);

            // Detect intersected objects
            var raycaster = new THREE.Raycaster();
            raycaster.set(worldPosition, worldDirection);
            var intersectedObjects = raycaster.intersectObjects(scene.object3D.children, true);
            for (var i = 0; i < intersectedObjects.length; ++i) {
                var intersectedObj = intersectedObjects[i];

                while (intersectedObj.object.parent && intersectedObj.object.el === undefined) {
                    intersectedObj.object = intersectedObj.object.parent;
                }

                // If the intersected object is the cursor itself
                // or the object is further than the max distance

                if (intersectedObj.object.el === undefined) { continue; }
                if (!intersectedObj.object.visible) { continue; }

                intersectedObj.object.el.emit("pointerIntersected");
            }
        })
    });

    var arrowHelper = null;
    var showArrowHelper = function (dir, origin) {
        var length = 1;
        var hex = 0xffff00;

        if (arrowHelper)
            scene.object3D.remove(arrowHelper)

        arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        scene.object3D.add(arrowHelper);
    }
});

function PointerFingerRaycaster(hand) {
    var intervalKey = null;
    this.hand = null;

    this.start = function (hand) {
        this.hand = hand;
        var self = this;
        intervalKey = setInterval(function () { self.intersect(); }, 100);
    };

    this.stop = function () {
        clearInterval(intervalKey);
    };

    this.intersect = function () {
        var handMesh = this.hand.data("riggedHand.mesh");
        var indexFinger = handMesh.fingers[1];

        $("a-scene").get(0).object3D.updateMatrixWorld();
        var position = new THREE.Vector3();
        position.setFromMatrixPosition(indexFinger.tip.matrixWorld);

        $("a-sphere").get(0).setAttribute("position", Utils.xyzString(position));
    };

    return this;
}