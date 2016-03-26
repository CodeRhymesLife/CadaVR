// this should get a new name, now that it includes grabEvent.
Leap.plugin('rotateAndZoom', function(scope){

	this.use('handHold');
  	this.use('pinchEvent');
	
	var container = scope.container
	
	var controller = this;
	var data = {
	    rotating: false,
	    zooming: false,
	}
	controller.rotateAndZoom = data;
    var leftHandPinched = false;
    var rightHandPinched = false;
	this.on('grab', function (hand) {
	    data.rotating = true;
	    controller.emit("rotateStart");
    })
    .on('ungrab', function (hand) {
        if (data.rotating)
            controller.emit("rotateEnd");
        data.rotating = false;
    })
    .on('pinch', function (hand) {
        if (hand.type == "right")
            rightHandPinched = true;
        if (hand.type == "left")
            leftHandPinched = true;

        data.zooming = rightHandPinched && leftHandPinched;
        if(data.zooming)
            controller.emit("zoomStart");
    })
    .on('unpinch', function (hand) {
        if (hand.type == "right")
            rightHandPinched = false;
        if (hand.type == "left")
            leftHandPinched = false;

         if(data.zooming)
             controller.emit("zoomEnd");

         data.zooming = false;
    })
    .on("handMoved", function (hand) {
        if (data.rotating) {
            var lastHand = controller.frame(1).hand(hand.id);
            var currentHand = controller.frame(0).hand(hand.id);

            var deltaPosition = {
                x: currentHand.palmPosition[0] - lastHand.palmPosition[0],
                y: currentHand.palmPosition[1] - lastHand.palmPosition[1],
            };

            var rotationFactor = 1000;
            var rotation = container.getAttribute("rotation") || { x: 0, y: 0, z: 0 };
            rotation.x -= deltaPosition.y * rotationFactor;
            rotation.y += deltaPosition.x * rotationFactor;
            container.setAttribute("rotation",
                String(rotation.x) + " " +
                String(rotation.y) + " " +
                String(rotation.z));
        }

        if (data.zooming && validHands(controller)) {
            var scale = container.object3D.scale;
            var scaleFactor = 1 + (getDistanceBetweenHands(controller, 0) - getDistanceBetweenHands(controller, 1))
            scaleFactor = Math.max(0.0000001, scaleFactor);
            console.log("Scale factor: " + scaleFactor);
            scale.x *= scaleFactor;
            scale.y *= scaleFactor;
            scale.z *= scaleFactor;
            container.setAttribute("scale", scale.x + " " + scale.y + " " + scale.z)
        }
    });
});

function validHands(controller) {
    return controller.frame(0).hands.length == 2 &&
        controller.frame(0).hands[0].valid &&
        controller.frame(0).hands[1].valid
}

function getDistanceBetweenHands(controller, frameNumber) {
    var handOne = controller.frame(frameNumber).hands[0];
    var handTwo = controller.frame(frameNumber).hands[1];

    return Math.abs(Leap.vec3.distance(handOne.palmPosition, handTwo.palmPosition));
}