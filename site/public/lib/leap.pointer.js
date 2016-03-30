// this should get a new name, now that it includes grabEvent.
Leap.plugin('pointer', function(scope){

	this.use('handHold');
  	//this.use('pinchEvent');
	
	scope.detectionInterval = scope.detectionInterval || 10; // Default is 100 milliseconds
	scope.hoverDistance = scope.hoverDistance || 0.2; // default is one centimeter
	scope.touchDistance = scope.touchDistance || 0.01; // default is one milimeter
	scope.handType = scope.handType || "right"; // default hand is the right hand 
	scope.touchDelay = scope.touchDelay || 1000; // Time between touches

    var scene = $("a-scene").get(0);

    var detectCollision = false;
    setInterval(function () { detectCollision = true }, scope.detectionInterval);

    var pointer = new Pointer(scope, scene, controller);

    Leap.loop({ background: true }, function (frame) {
        if (!detectCollision || frame.hands.length <= 0)
            return;

        frame.hands.forEach(function (hand) {
            if (hand.type == scope.handType) {
                hand.data("pointer", pointer)
                pointer.update(hand, detectCollision);
            }

            detectCollision = false;
        })
    });
});

function Pointer(scope, scene, controller) {
    this.hand = null;
    this.position = null;
    this.direction = null;
    this.childContainer = null;
    this.childElement = null;
	this.lastTouch = 0;

	var debugArrow;
	
    this.update = function (hand, detectIntersection) {
        this.hand = hand;
        var indexFinger = this.getIndexFinger();
        if (!indexFinger)
            return;

        this.setPointerPositionAndDirection();

        // Show the debug arrow?
        if (scope.debug)
            debugArrow = Utils.showArrowHelper(this.position, this.direction, debugArrow);

        if (detectIntersection)
            this.detectIntersection();
    };

    this.getWorldPosition = function () {
        var position = new THREE.Vector3();
        scene.object3D.updateMatrixWorld();
        position.setFromMatrixPosition(this.getIndexFinger().tip.matrixWorld);
        return position;
    }

    this.setPointerPositionAndDirection = function (indexFinger) {
        this.position = this.getWorldPosition()

        // Get the direction
        this.direction = this.getIndexFinger().worldDirection;
    };

    this.detectIntersection = function (hand) {
        var intersectedObj = this.getClosestObject();

		var prevIntersectedEl = this.intersectedObj != null ? this.intersectedObj.object.el : null;
        var newIntersectedEl = intersectedObj != null ? intersectedObj.object.el : null;
        if (prevIntersectedEl != newIntersectedEl && prevIntersectedEl != null)
            prevIntersectedEl.removeState("pointerHovered");

		this.intersectedObj = intersectedObj;

        if (!this.intersectedObj)
            return;
			
		newIntersectedEl.addState("pointerHovered");

		// Gets the touch el (same as new intersected el, but queries a shorter distance)
		var touchEl = this.getTouchElement();
        if (touchEl != null && Date.now() - this.lastTouch > scope.touchDelay) {
            touchEl.emit("pointerTouch", { pointer: this });
			this.lastTouch = Date.now();
		}
    }

    this.getClosestObject = function (indexFinger) {
        // Detect intersected objects
        var raycaster = new THREE.Raycaster(this.position, this.direction, 0, scope.hoverDistance);
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

    this.attachChild = function (childElement) {
        if (this.childElement != null)
            throw "attempting to attach a child when a child already exists";

        if (!this.childContainer) {
            this.childContainer = new THREE.Group()
            this.getIndexFinger().tip.add(this.childContainer);
        }

        this.childElement = childElement;
        childElement.object3D.parent.updateMatrixWorld();
        THREE.SceneUtils.attach(childElement.object3D, scene.object3D, this.childContainer);
        return childElement;
    }

    this.detachChild = function (newParentElement) {
        if (this.childElement == null)
            throw "attempting to detach a child when no child exists";

        var childElement = this.childElement;
        childElement.object3D.parent.updateMatrixWorld();
        THREE.SceneUtils.detach(childElement.object3D, childElement.object3D.parent, newParentElement.object3D);
        this.childElement = null;
        return childElement;
    }
	
	this.getTouchElement = function() {
		return this.intersectedObj != null && this.intersectedObj.distance <= scope.touchDistance ?
					this.intersectedObj.object.el : null;
	}

    this.hasChild = function () {
        return this.childElement != null;
    }

    this.getIndexFinger = function () {
        var handMesh = this.hand.data("riggedHand.mesh");
        if (!handMesh)
            return null;

        return handMesh.fingers[1];
    }

    
}