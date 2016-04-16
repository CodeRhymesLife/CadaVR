// this should get a new name, now that it includes grabEvent.
Leap.plugin('rigged-hand-touch', function(scope){

    var controller = this;
    var scene = $("a-scene").get(0);

	this.use('handHold');
  	//this.use('pinchEvent');
	
	scope.detectionInterval = scope.detectionInterval || 100; // Default is 100 milliseconds
	scope.touchDistance = scope.touchDistance || 0.05; // default is one milimeter
	scope.handType = scope.handType || "right"; // default hand is the right hand 
    scope.debug = scope.debug || false;

    var scene = $("a-scene").get(0);

    var createTip = function (name) { return new FingerTipToucher(name, scope, scene, controller); }
    var tips = [
        createTip("thumb"),
        createTip("index"),
        createTip("middle"),
        createTip("ring"),
        createTip("pinky"),
    ]

    var grabbingObject = null;
    Leap.loop({ background: true }, function (frame) {
		if (frame.hands.length <= 0)
            return;

        frame.hands.forEach(function (hand) {
            if (hand.type == scope.handType && hand.data("riggedHand.mesh")) {
                var handMesh = hand.data("riggedHand.mesh");
                for(var fingerIndex = 0; fingerIndex < tips.length; fingerIndex++) {
                    var fingerMesh = handMesh.fingers[fingerIndex]
                    tips[fingerIndex].update( hand, fingerMesh );
                }
                
                var thumbIntersection = tips[0].intersectedEl;
                var grabObject = false;
                if(thumbIntersection) {
                    for(var fingerIndex = 1; fingerIndex < tips.length; fingerIndex++) {
                        if(tips[fingerIndex].intersectedEl == thumbIntersection) {
                            grabObject = true
                            break;
                        }
                    }
                }
                
                var newObjectToGrab = grabObject ? thumbIntersection : null;
                if(grabbingObject && newObjectToGrab != grabbingObject) {
                    grabbingObject.removeState("hand.grabbing");
                    grabbingObject = null;
                }
                
                if(newObjectToGrab) {
                    newObjectToGrab.addState("hand.grabbing");
                    grabbingObject = newObjectToGrab;
                }
			}
        })
    });
});

function FingerTipToucher (name, scope, scene, controller) {
    this.name = name;
    this.hand = null;
    this.finger = null;
    this.position = null;
    this.direction = null;
    this.intersectedObj = null;
    this.intersectedEl = null;
    
    var detectIntersection = true;
    
    this.update = function (hand, finger) {
        this.hand = hand;
        this.finger = finger;
        
        this.setPosittionAndDirection();
        
        if(detectIntersection) {
        	this.detectIntersection();
			detectIntersection = false;
			setTimeout(function() { detectIntersection = true; }, scope.detectionInterval)
		}
    }
    
    this.setPosittionAndDirection = function () {
        this.position = this.finger.tip.getWorldPosition();
        
        var matrix = new THREE.Matrix4();
        matrix.extractRotation( this.finger.tip.matrixWorld );
        this.direction = new THREE.Vector3( 0, -1, 0 );
        if(this.name == "thumb")
            this.direction = new THREE.Vector3( -1, -1, 0 );
        
        this.direction.applyProjection(matrix)
        this.direction.normalize();
    }
    
    this.detectIntersection = function () {        
        var intersectedObj = this.getClosestObject();

		var prevIntersectedEl = this.intersectedEl;
        var newIntersectedEl = intersectedObj != null ? intersectedObj.object.el : null;
        if (prevIntersectedEl != newIntersectedEl && prevIntersectedEl != null) {
            //prevIntersectedEl.removeState(this.name + ".finger.touching");
            //controller.emit(this.name + ".finger.touchCleared", { finger: this })
        }

		this.intersectedObj = intersectedObj;
        this.intersectedEl = newIntersectedEl;

        if (!this.intersectedObj)
            return;
		
        this.intersectedEl = this.intersectedObj.object.el;
		//newIntersectedEl.addState(this.name + ".finger.touching");
        //controller.emit(this.name + ".finger.touching", { finger: this })
    }

    this.getClosestObject = function () {
        // Detect intersected objects
        var buffer = this.direction.clone().multiplyScalar(scope.touchDistance)
        var raycasterPisition = this.position.clone().sub(buffer);
        
        if(scope.debug)
            debugArrow = Utils.showArrowHelper(raycasterPisition, this.direction, this.hand.type + "-" + this.name + "-arrow");
        
        var raycaster = new THREE.Raycaster(raycasterPisition, this.direction, 0, scope.touchDistance * 2);
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
}

function Pointer(scope, scene, controller) {
    this.hand = null;
    this.position = null;
    this.direction = null;
    this.childContainer = null;
    this.childElement = null;
	this.lastTouch = 0;
	this.hoverDistance = scope.hoverDistance;
	this.touchDistance = scope.touchDistance;

	var debugArrow;
	var detectIntersection = true;
	
    this.update = function (hand) {
        this.hand = hand;
        var indexFinger = this.getIndexFinger();
        if (!indexFinger)
            return;

        this.setPointerPositionAndDirection();

        // Show the debug arrow?
        if (scope.debug)
            debugArrow = Utils.showArrowHelper(this.position, this.direction, debugArrow);

		if(detectIntersection) {
        	this.detectIntersection();
			detectIntersection = false;
			setTimeout(function() { detectIntersection = true; }, scope.detectionInterval)
		}
    };

    this.getWorldPosition = function () {
        return this.getIndexFinger().tip.getWorldPosition();
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