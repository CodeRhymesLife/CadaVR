Trash = function (element, debug) {
    var position = element.object3D.getWorldPosition();
    var direction = new THREE.Vector3(0, 1, 0);
    var detectionDistance = 0.8;
    
    var self = this;
    setInterval(function () { self.check() }, 500);
    
    this.check = function () {
        var intersectedObjInfo = this.getClosestObject();
        if(!intersectedObjInfo)
            return;
            
        var intersectedObj = intersectedObjInfo.object;
        if(!intersectedObj.el.is("hand.grabbing")) {
            intersectedObj.el.setAttribute("visible", "false");
            intersectedObj.el.addState("trashed");
        }    
    }
    
    this.getClosestObject = function () {
        if(debug)
            Utils.showArrowHelper(position, direction, "trash", detectionDistance);
        
        var raycaster = new THREE.Raycaster(position, direction, 0, detectionDistance);
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