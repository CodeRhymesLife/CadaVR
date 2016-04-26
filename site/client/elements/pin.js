Pin = function (debug) {
    THREE.Group.call(this)
    
    var sphereGeometry = new THREE.SphereGeometry(0.5);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    var cylingerLengthScale = 2;
    var cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, cylingerLengthScale);
    var cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    this.cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    this.cylinder.position.set(0, -cylingerLengthScale/2, 0);
    
    this.add(this.sphere);
    this.add(this.cylinder);
    
    this.scale.multiplyScalar(0.05);
    
    var key = null;
    this.enable = function () {
        this.disable();
            
        var self = this;
        key = setInterval(function () { self.check() }, 500);
    }
    
    this.disable = function () {
        // Do a final check before we stop checking
        this.check()
        
        if(key)
            clearInterval(key);
    }
    
    this.check = function () {
        var intersectedObjInfo = this.getClosestObject();
        if(!intersectedObjInfo)
            return;
            
        var intersectedObj = intersectedObjInfo.object;
        if(!intersectedObj.el.is("hand.grabbing")) {
            intersectedObj.el.addState("pinned");
        }    
    }
    
    var cylingerLength = this.scale.x * cylingerLengthScale;
    this.getClosestObject = function () {        
        var matrix = new THREE.Matrix4();
        matrix.extractRotation( this.cylinder.matrixWorld );
        var direction = new THREE.Vector3( 0, -1, 0 );
        direction.applyProjection(matrix)
        direction.normalize();
        
        var position = this.cylinder.getWorldPosition().sub(direction.clone().multiplyScalar(cylingerLength / 2));

        if(debug)
            Utils.showArrowHelper(position, direction, "pin", cylingerLength + cylingerLength * 0.1);
        
        var raycaster = new THREE.Raycaster(position, direction, 0, cylingerLength);
        var intersectedInfoArr = raycaster.intersectObjects(Utils.sceneEl.object3D.children, true);
        for (var i = 0; i < intersectedInfoArr.length; ++i) {
            var intersectedInfo = intersectedInfoArr[i];

            if (!intersectedInfo.object.visible) { continue; }
            if (intersectedInfo.object.el === undefined) { continue; }

            return intersectedInfo;
        }

        return null;
    }
}

Pin.prototype = Object.create(THREE.Group.prototype);