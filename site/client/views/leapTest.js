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

    var triggerEvent = function (element, eventName, details) {
        console.log("Firing event: " + eventName + ", details: " + JSON.stringify(details));

        // create a jQuery event
        var e = $.Event(eventName);

        // set data
        e.details = details

        // trigger event - must trigger on document
        $(element).trigger(e);
    }

    var detectPinchOrGrab = function (currentStrength, lastStrength, threshold, startEventName, endEventName) {
        var eventName = null;
        if (lastStrength > threshold && currentStrength < threshold) {
            eventName = endEventName;
        }
        else if (lastStrength < threshold && currentStrength > threshold) {
            eventName = startEventName;
        }

        if (eventName != null)
            triggerEvent(cursor.intersectedEl || document, eventName, { strength: currentStrength });
    }

    var detectHandMoved = function (currentHand, lastHand) {
        if(currentHand.palmPosition[0] != lastHand.palmPosition[0] ||
            currentHand.palmPosition[1] != lastHand.palmPosition[1] ||
            currentHand.palmPosition[2] != lastHand.palmPosition[2])
        {
            triggerEvent(document, "handMoved", { handId: currentHand.id });
        }
    }

    Leap.loop({ background: true }, {
        hand: function (hand) {
            var lastHand = controller.frame(1).hand(hand.id);
            if (!lastHand.valid)
                return;

            // Detect pinch
            detectPinchOrGrab(
                hand.pinchStrength.toPrecision(2),
                lastHand.pinchStrength.toPrecision(2),
                0.9,
                "pinchStart",
                "pinchEnd"
            );

            // Detect grab
            detectPinchOrGrab(
                hand.grabStrength.toPrecision(2),
                lastHand.grabStrength.toPrecision(2),
                0.7,
                "grabStart",
                "grabEnd"
            );

            detectHandMoved(hand, lastHand);
        }
    });

    $("a-cube").on("keyTap screenTap", function () {
        $(this).get(0).setAttribute("color", getRandomColor());
    });

    var rotate = false;
    $(document).on("grabStart", function (e) {
        rotate = true;
    });
    $(document).on("grabEnd", function (e) {
        rotate = false;
    });

    $(document).on("handMoved", function (e) {
        if (!rotate)
            return;

        var lastHand = controller.frame(1).hand(e.details.handId);
        var currentHand = controller.frame(0).hand(e.details.handId);

        var deltaPosition = {
            y: currentHand.palmPosition[0] - lastHand.palmPosition[0],
            x: currentHand.palmPosition[1] - lastHand.palmPosition[1],
        };

        var rotationFactor = 1000;
        var cube = $("a-cube").get(0);
        var rotation = cube.getAttribute("rotation") || { x: 0, y: 0, z: 0 };
        rotation.x -= deltaPosition.x * rotationFactor;
        rotation.y += deltaPosition.y * rotationFactor;
        cube.setAttribute("rotation",
            String(rotation.x) + " " +
            String(rotation.y) + " " +
            String(rotation.z));
    });
});

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}