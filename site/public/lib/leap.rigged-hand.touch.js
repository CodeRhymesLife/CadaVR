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
    this.grabbedObj = null;
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
                if(touchFingerTip.intersectedObj == thumb.intersectedObj) {
                    
                    // Grab the element
                    // If all fingers are extended grab the parent (if this object has a parent)
                    // Otherwise, grab the object that was selected
                    var fingersExtended = true;
                    this.hand.fingers.forEach(function (finger) { fingersExtended = fingersExtended && finger.extended })
                    
                    var objToGrab = thumb.intersectedObj;
                    //if(fingersExtended && objToGrab.parent && objToGrab.parent.type != "Scene" )
                    //    objToGrab = objToGrab.parent;
                    
                    this.grab(objToGrab)
                    break;
                }
            }
        }
    }
    
    this.grab = function (obj) {
        console.log("ToucherHand grabbing element")
        
        obj.parent.updateMatrixWorld();
        THREE.SceneUtils.detach(obj, obj.parent, Utils.sceneEl.object3D);
        
        var position = obj.getWorldPosition()
        Utils.sceneEl.object3D.updateMatrixWorld();
        THREE.SceneUtils.attach(obj, Utils.sceneEl.object3D, this.hand.data("riggedHand.mesh"));
        
        this.grabbedObj = obj;
        thumb.grab();
        
        if(this.grabbedObj.el)
            this.grabbedObj.el.addState("hand.grabbing");
    }
    
    this.ungrab = function () {
        if(!this.isGrabbing())
            return;

        console.log("ToucherHand ungrabbing element")

        this.grabbedObj.parent.updateMatrixWorld();
        THREE.SceneUtils.detach(this.grabbedObj, this.grabbedObj.parent, Utils.sceneEl.object3D);
        
        if(this.grabbedObj.el)
            this.grabbedObj.el.removeState("hand.grabbing");

        thumb.ungrab();
        this.grabbedObj = null;
    }
    
    this.isGrabbing = function () {
        return this.grabbedObj != null;
    }
}

function ToucherFingerTip (index, name, scope, scene, controller) {
    this.index = index;
    this.name = name;
    this.hand = null;
    this.finger = null;
    this.position = null;
    this.direction = null;
    this.intersectedInfo = null;
    this.intersectedObj = null;

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
        this.intersectedInfo = this.getClosestObject();
        this.intersectedObj = this.intersectedInfo != null ? this.intersectedInfo.object : null;

		return this.intersectedInfo != null;
    }

    this.getClosestObject = function () {
        // Detect intersected objects
        var buffer = this.direction.clone().multiplyScalar(scope.touchDistance)
        var raycasterPisition = this.position.clone().sub(buffer);
        
        if(scope.debug)
            debugArrow = Utils.showArrowHelper(raycasterPisition, this.direction, this.hand.type + "-" + this.name + "-arrow");
        
        var raycaster = new THREE.Raycaster(raycasterPisition, this.direction, 0, scope.touchDistance * 2);
        var intersectedInfoArr = raycaster.intersectObjects(scene.object3D.children, true);
        for (var i = 0; i < intersectedInfoArr.length; ++i) {
            var intersectedInfo = intersectedInfoArr[i];

            while (intersectedInfo.object.parent && intersectedInfo.object.el === undefined) {
                intersectedInfo.object = intersectedInfo.object.parent;
            }

            if (!intersectedInfo.object.visible) { continue; }
            if (intersectedInfo.object.el == Utils.cameraEl) { continue; }

            return intersectedInfo
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

        console.log("thumb distance to grab position: " + this.grabPosition.distanceTo(this.getLocalThumbTipPosition()))
        return this.grabPosition && this.grabPosition.distanceTo(this.getLocalThumbTipPosition()) < 0.7;
    }
    
    this.grab = function () {
        self = this;
        
        // Delay recording the users grab position so they have time to adjust the position of their hand
        setTimeout(function () {
            self.grabPosition = self.getLocalThumbTipPosition();
            waitingForGrab = false;    
        }, 500);
        waitingForGrab = true;
    }
    
    this.ungrab = function () {
        this.grabPosition = null;
    }
    
    this.getLocalThumbTipPosition = function () {
        return this.finger.worldToLocal(this.position.clone());
    }
}