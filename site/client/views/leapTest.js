Template.leapTest.onRendered(function () {
    var cursor = $("a-camera").get(0).components.cursor;

    var controller = LeapUtils.createController();

    controller.on("gesture", function (gesture) {
        console.log(gesture.type + " Gesture");

        var data = {};
        switch (gesture.type) { // circle, keyTap, screenTap, swipe
            case "swipe":
                // Classify swipe as either horizontal or vertical
                var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

                // Classify as right-left or up-down
                if (isHorizontal) {
                    if (gesture.direction[0] > 0) {
                        data.direction = "right";
                    } else {
                        data.direction = "left";
                    }
                } else { //vertical
                    if (gesture.direction[1] > 0) {
                        data.direction = "up";
                    } else {
                        data.direction = "down";
                    }
                }

                data.duration = gesture.duration;
                data.speed = gesture.speed / 1000; // M / s
                break;
        }

        if (cursor.intersectedEl) {
            data.type = gesture.type;
            data.id = gesture.id;
            data.handIds = gesture.handIds;
            data.pointableIds = gesture.pointableIds;
            if (data.position)
                data.position = gesture.position.map(function (p) { return p / 1000; }); // M
            data.state = gesture.state;

            // Emit event on element
            cursor.emit(gesture.type, data);
        }
    });

    $("a-cube").on("keyTap screenTap", function () {
        $(this).get(0).setAttribute("color", getRandomColor());
    });

    var cube = $("a-cube").get(0);
    var rotate = null;
    var zoom = false;
    var leftHandPinched = false;
    var rightHandPinched = false;
    controller.on('grab', function (hand) {
        rotate = hand;
    })
    .on('ungrab', function (hand) {
        rotate = null;
    })
    .on('pinch', function (hand) {
        if (hand.type == "right")
            rightHandPinched = true;
        if (hand.type == "left")
            leftHandPinched = true;

        zoom = rightHandPinched && leftHandPinched;
    })
    .on('unpinch', function (hand) {
        if (hand.type == "right")
            rightHandPinched = false;
        if (hand.type == "left")
            leftHandPinched = false;

        zoom = false;
    })
    .on("handMoved", function (hand) {
        if (rotate) {
            var lastHand = controller.frame(1).hand(hand.id);
            var currentHand = controller.frame(0).hand(hand.id);

            var deltaPosition = {
                x: currentHand.palmPosition[0] - lastHand.palmPosition[0],
                y: currentHand.palmPosition[1] - lastHand.palmPosition[1],
            };

            var rotationFactor = 1000;
            var rotation = cube.getAttribute("rotation") || { x: 0, y: 0, z: 0 };
            rotation.x -= deltaPosition.y * rotationFactor;
            rotation.y += deltaPosition.x * rotationFactor;
            cube.setAttribute("rotation",
                String(rotation.x) + " " +
                String(rotation.y) + " " +
                String(rotation.z));
        }
        
        if (zoom && validHands()) {
            var scale = cube.object3D.scale;
            var scaleFactor = 1 + (getDistanceBetweenHands(0) - getDistanceBetweenHands(1))
            scaleFactor = Math.max(0.0000001, scaleFactor);
            console.log("Scale factor: " + scaleFactor);
            scale.x *= scaleFactor;
            scale.y *= scaleFactor;
            scale.z *= scaleFactor;
            cube.setAttribute("scale", scale.x + " " + scale.y + " " + scale.z)
        }
    });
});

function validHands() {
    return controller.frame(0).hands.length == 2 &&
        controller.frame(0).hands[0].valid &&
        controller.frame(0).hands[1].valid
}

function getDistanceBetweenHands(frameNumber) {
    var handOne = controller.frame(frameNumber).hands[0];
    var handTwo = controller.frame(frameNumber).hands[1];

    return Math.abs(Leap.vec3.distance(handOne.palmPosition, handTwo.palmPosition));
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}