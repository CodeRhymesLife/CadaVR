// this should get a new name, now that it includes grabEvent.
Leap.plugin('rigged-hand-touch', function(scope){

    var controller = this;
    var scene = $("a-scene").get(0);

	this.use('handHold');
  	//this.use('pinchEvent');
	
    scope.leftHand = scope.leftHand || true;
    scope.rightHand = scope.rightHand || true;
	scope.detectionInterval = scope.detectionInterval || 100; // Default is 100 milliseconds
	scope.touchDistance = scope.touchDistance || 0.1; // default is 10 centimeters
	scope.handType = scope.handType || "right"; // default hand is the right hand 
    scope.debug = scope.debug || false;

    var scene = $("a-scene").get(0);

    var rightHand = new ToucherHand("right", scope, scene, controller);
    var leftHand = new ToucherHand("left", scope, scene, controller);

    Leap.loop({ background: true }, function (frame) {
		if (frame.hands.length <= 0)
            return;

        frame.hands.forEach(function (hand) {
            if(!hand.data("riggedHand.mesh"))
                return;

            if (scope.rightHand && hand.type == "right")
                rightHand.update(hand);
            else if (scope.leftHand && hand.type == "left")
                leftHand.update(hand);
        })
    });
});

function ToucherHand (type, scope, scene, controller) {
    this.hand = null;
    this.grabbedElement = null;
    this.type = type;
    this.nextUpdate = scope.detectionInterval;
    
    var createFingerTip = function (index, name) { return new ToucherFingerTip(index, name, scope, scene, controller); }
    var thumb = new ToucherThumb(scope, scene, controller);
    var fingers = [
        createFingerTip(1, "index"),
        createFingerTip(2, "middle"),
        createFingerTip(3, "ring"),
        createFingerTip(4, "pinky"),
    ];
    
    var detectIntersection = true;
    this.update = function (hand) {
        if(!detectIntersection)
            return;

        this.setNextUpdate(scope.detectionInterval);

        this.hand = hand;
        
        if(this.isGrabbing())
            this.checkGrab();
        else
            this.detectIntersections();
            
        detectIntersection = false;
        setTimeout(function() { detectIntersection = true; }, this.nextUpdate)
    }
    
    this.setNextUpdate = function (delay) {
        this.nextUpdate = delay;
    }
    
    this.checkGrab = function () {
        if(!this.isGrabbing())
            return;

        thumb.update( this.hand );
        if(!thumb.isWithinGrabDistance()) {
            this.ungrab();
            
            // Wait half a second before the next update
            this.setNextUpdate(500)
        }
    }
    
    
    this.detectIntersections = function () {
        thumb.update( this.hand );
        if(thumb.detectIntersection()) {
            // Detect intersection on each finger
            for(var fingerIndex = 0; fingerIndex < fingers.length; fingerIndex++) {
                var touchFingerTip = fingers[fingerIndex];
                touchFingerTip.update( this.hand );
                touchFingerTip.detectIntersection();
                
                // If this finger is touching the same item as the thumb, grab it
                if(touchFingerTip.intersectedEl == thumb.intersectedEl) {
                    
                    // Grab the element
                    // If all fingers are extended grab the parent (if this object has a parent)
                    // Otherwise, grab the object that was selected
                    var fingersExtended = true;
                    this.hand.fingers.forEach(function (finger) { fingersExtended = fingersExtended && finger.extended })
                    
                    var elementToGrab = thumb.intersectedEl;
                    if(fingersExtended && thumb.intersectedEl.object3D.parent.el)
                        elementToGrab = thumb.intersectedEl.object3D.parent.el;
                    
                    this.grab(elementToGrab)
                    break;
                }
            }
        }
    }
    
    this.grab = function (element) {
        console.log("ToucherHand grabbing element")
        
        element.object3D.parent.updateMatrixWorld();
        THREE.SceneUtils.detach(element.object3D, element.object3D.parent, Utils.sceneEl.object3D);
        
        var position = element.object3D.getWorldPosition()
        Utils.sceneEl.object3D.updateMatrixWorld();
        THREE.SceneUtils.attach(element.object3D, Utils.sceneEl.object3D, this.hand.data("riggedHand.mesh"));
        
        this.grabbedElement = element;
        thumb.grab();
        this.grabbedElement.addState("hand.grabbing");
    }
    
    this.ungrab = function () {
        if(!this.isGrabbing())
            return;

        console.log("ToucherHand ungrabbing element")

        this.grabbedElement.object3D.parent.updateMatrixWorld();
        THREE.SceneUtils.detach(this.grabbedElement.object3D, this.grabbedElement.object3D.parent, Utils.sceneEl.object3D);
        
        this.grabbedElement.removeState("hand.grabbing");
        thumb.ungrab();
        this.grabbedElement = null;
    }
    
    this.isGrabbing = function () {
        return this.grabbedElement != null;
    }
}

function ToucherFingerTip (index, name, scope, scene, controller) {
    this.index = index;
    this.name = name;
    this.hand = null;
    this.finger = null;
    this.position = null;
    this.direction = null;
    this.intersectedObj = null;
    this.intersectedEl = null;

    this.update = function (hand) {
        this.hand = hand;
        this.finger = hand.data("riggedHand.mesh").fingers[this.index];
        this.setPosittionAndDirection();
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
            return false;
		
        this.intersectedEl = this.intersectedObj.object.el;
		return true;
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
            if (intersectedObj.object.el == Utils.cameraEl) { continue; }

            return intersectedObj
        }

        return null;
    }
}

function ToucherThumb (scope, scene, controller) {
    ToucherFingerTip.call(this, 0, "thumb", scope, scene, controller)
    
    var waitingForGrab = false;
    
    this.grabPosition = null;
    
    this.isWithinGrabDistance = function () {
        if(waitingForGrab)
            return true;

        console.log("thumb distance to grab position: " + this.grabPosition.distanceTo(this.getLocalHandPosition()))
        return this.grabPosition && this.grabPosition.distanceTo(this.getLocalHandPosition()) < 0.7;
    }
    
    this.grab = function () {
        self = this;
        
        // Delay recording the users grab position so they have time to adjust the position of their hand
        setTimeout(function () {
            self.grabPosition = self.getLocalHandPosition();
            waitingForGrab = false;    
        }, 500);
        waitingForGrab = true;
    }
    
    this.ungrab = function () {
        this.grabPosition = null;
    }
    
    this.getLocalHandPosition = function () {
        return this.finger.worldToLocal(this.position.clone());
    }
}