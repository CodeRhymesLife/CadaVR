// this should get a new name, now that it includes grabEvent.
Leap.plugin('leap-motion-hand-resizing', function(scope){

    var controller = this;

	this.use('leap-motion-hand-grabbing');

    Leap.loop({ background: true }, function (frame) {
		if (frame.hands.length != 2)
            return;

		var leftHand = null;
		var rightHand = null;
        frame.hands.forEach(function (hand) {
            if(!hand.data("riggedHand.mesh"))
                return;

            if (hand.type == "right")
                rightHand = hand;
            else if (hand.type == "left")
                leftHand = hand;
        });
		
		if(!leftHand || !rightHand)
			return;
		
		var leftToucherHand = leftHand.data("toucherHand");
		var rightToucherHand = rightHand.data("toucherHand");
		
		// If both hands are grabbing the same object
		// Zoom in on the object
		if(leftToucherHand.isGrabbing() && rightToucherHand.isGrabbing() && leftToucherHand.grabbedObj == rightToucherHand.grabbedObj) {
			var objectToResize = leftToucherHand.grabbedObj;
			
			var leftThumbWorldPosition = leftHand.data("riggedHand.mesh").fingers[0].getWorldPosition();
			var rightThumbWorldPosition = rightHand.data("riggedHand.mesh").fingers[0].getWorldPosition();
			var distanceBetweenFingers = leftThumbWorldPosition.distanceTo(rightThumbWorldPosition);
			
			// Resize the object
			var box = new THREE.Box3().setFromObject(objectToResize);
			var boxSize = box.size();
			var scaleFactor = distanceBetweenFingers / boxSize.x;
			objectToResize.scale.multiplyScalar(scaleFactor);
			
			// Center the object between and in front of the hands
			var center = rightThumbWorldPosition.clone().sub(leftThumbWorldPosition).multiplyScalar(0.5).add(leftThumbWorldPosition);
			box = new THREE.Box3().setFromObject(objectToResize);
			center.z -= box.size().z/2;
			var localCenter = objectToResize.parent.worldToLocal(center);
			objectToResize.position.copy(localCenter);
		}
    });
});