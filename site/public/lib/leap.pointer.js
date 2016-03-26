// this should get a new name, now that it includes grabEvent.
Leap.plugin('pointer', function(scope){

	this.use('handHold');
  	//this.use('pinchEvent');
	
	scope.detectionInterval = scope.detectionInterval || 10; // Default is 100 milliseconds
	scope.touchDistance = scope.touchDistance || 0.1; // default is one centimeter

    var scene = $("a-scene").get(0);

    var detectCollision = false;
    setInterval(function () { detectCollision = true }, scope.detectionInterval);

    var leftPointer = new Pointer(scope, scene);
    var rightPointer = new Pointer(scope, scene);

    Leap.loop({ background: true }, function (frame) {
        if (!detectCollision || frame.hands.length <= 0)
            return;

        frame.hands.forEach(function (hand) {
            if (hand.type == "left")
                leftPointer.detectIntersection(hand);
            else if (hand.type == "right")
                rightPointer.detectIntersection(hand);

            detectCollision = false;
        })
    });
});

function Pointer(scope, scene) {
    var raycaster = new THREE.Raycaster();

    this.intersectedEl = null;
    this.detectIntersection = function (hand) {
        var handMesh = hand.data("riggedHand.mesh");
        if (!handMesh)
            return;

        var indexFinger = handMesh.fingers[1];
        var intersectedObj = this.getClosestObject(indexFinger);

        var newIntersectedEl = intersectedObj != null ? intersectedObj.object.el : null;
        if (this.intersectedEl != newIntersectedEl && this.intersectedEl != null)
            this.intersectedEl.removeState("hovered");

        this.intersectedEl = newIntersectedEl;

        if (this.intersectedEl)
            this.intersectedEl.addState("hovered");

        if (!this.intersectedEl)
            return;

        if (intersectedObj.distance <= scope.touchDistance)
            this.intersectedEl.emit("pointerTouch");
    }

    this.getClosestObject = function (indexFinger) {
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

            return intersectedObj
        }

        return null;
    }

    var arrowHelper = null;
    var showArrowHelper = function (dir, origin) {
        var length = 1;
        var hex = 0xffff00;

        if (arrowHelper)
            scene.object3D.remove(arrowHelper)

        arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        scene.object3D.add(arrowHelper);
    }
}