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
    scope.ungrabDeltaStrength = scope.ungrabDeltaStrength || 0.3; // Change in grab stregth required to ungrab an object
    scope.debug = scope.debug || false;

    var scene = $("a-scene").get(0);

    var rightHand = new ToucherHand("right", TouchInfo.rightHand, scope, scene, controller);
    var leftHand = new ToucherHand("left", TouchInfo.leftHand, scope, scene, controller);

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

function TouchInfo () {
    var touchables = [];
    var getTouchObjectFuncs = {};
    
    this.getTouchables = function () {
        return touchables;
    };
    
    this.add = function (object, getTouchObject) {
        getTouchObjectFuncs[object.uuid] = getTouchObject;
        touchables.push(object);
    };
    
    this.remove = function (object) {
        var index = touchables.indexOf(object);
        if(index != -1) {
            touchables.splice(index, 1);
            delete getTouchObjectFuncs[object.uuid];
        }
    };
    
    this.getTouchObject = function (object) {
        return getTouchObjectFuncs[object.uuid] ? getTouchObjectFuncs[object.uuid](object) : object;
    }
}

TouchInfo.leftHand = new TouchInfo();
TouchInfo.rightHand = new TouchInfo();

function ToucherHand (type, touchInfo, scope, scene, controller) {
    this.hand = null;
    this.grabbedObj = null;
    this.initialHoldStrength = null;
    this.type = type;
    this.nextUpdate = scope.detectionInterval;
    
    var createFingerTip = function (index, name) { return new ToucherFingerTip(index, name, touchInfo, scope, scene, controller); }
    var thumb = createFingerTip(0, "thumb");
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
    
    var ungrabConfidence = 0;
    this.checkGrab = function () {
        if(!this.isGrabbing())
            return;

        if(this.initialHoldStrength == null) {
            ungrabConfidence = 0;
            return;
        }
            

        if(Math.abs(this.initialHoldStrength - this.hand.pinchStrength) > scope.ungrabDeltaStrength &&
            Math.abs(this.initialHoldStrength - this.hand.grabStrength) > scope.ungrabDeltaStrength) {
            ungrabConfidence++;
            this.setNextUpdate(50);
            
            if(ungrabConfidence > 3) {
                ungrabConfidence = 0;
                this.ungrab();
            
                // Wait half a second before the next update
                this.setNextUpdate(1000)
            }
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
                    this.grab(touchInfo.getTouchObject(thumb.intersectedObj))
                    break;
                }
            }
        }
    }
    
    this.grab = function (obj) {
        console.log("ToucherHand grabbing element type '" + obj.type + "' with grab strength '" + this.hand.pinchStrength + "'")
        
        obj.parent.updateMatrixWorld();
        THREE.SceneUtils.detach(obj, obj.parent, Utils.sceneEl.object3D);

        Utils.sceneEl.object3D.updateMatrixWorld();
        THREE.SceneUtils.attach(obj, Utils.sceneEl.object3D, this.hand.data("riggedHand.mesh"));
        
        this.grabbedObj = obj;
        
        // Delay setting the grabstregth to give the user a moment to adjust their hands
        var self = this;
        setTimeout(function () { self.initialHoldStrength = Math.max(self.hand.pinchStrength, self.hand.grabStrength); }, 1000);
        
        if(this.grabbedObj.el)
            this.grabbedObj.el.addState("hand.grabbing");
    }
    
    this.ungrab = function () {
        if(!this.isGrabbing())
            return;

        console.log("ToucherHand ungrabbing element type '" + this.grabbedObj.type + "' with grab strength '" + this.hand.pinchStrength + "'")

        this.grabbedObj.parent.updateMatrixWorld();
        THREE.SceneUtils.detach(this.grabbedObj, this.grabbedObj.parent, Utils.sceneEl.object3D);
        
        if(this.grabbedObj.el)
            this.grabbedObj.el.removeState("hand.grabbing");

        this.initialHoldStrength = null;
        this.grabbedObj = null;
    }
    
    this.isGrabbing = function () {
        return this.grabbedObj != null;
    }
}

function ToucherFingerTip (index, name, touchInfo, scope, scene, controller) {
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
        var intersectedInfoArr = raycaster.intersectObjects(touchInfo.getTouchables(), true);
        for (var i = 0; i < intersectedInfoArr.length; ++i) {
            var intersectedInfo = intersectedInfoArr[i];

            if (!intersectedInfo.object.visible) { continue; }

            return intersectedInfo;
        }

        return null;
    }
}