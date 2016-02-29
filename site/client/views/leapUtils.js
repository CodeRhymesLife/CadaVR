LeapUtils = {};
LeapUtils.createController = function () {
    var sceneEl = $("a-scene").get(0);
    var scene = sceneEl.object3D;
    var camera = sceneEl.cameraEl.components.camera.camera;

    window.controller = controller = new Leap.Controller({
        host: Cookies.get('leapHost'),
        background: true,
        optimizeHMD: true,
        enableGestures: true,
    });

    controller.use('transform', {
        quaternion: (new THREE.Quaternion).setFromEuler(new THREE.Euler(Math.PI * -0.3, 0, Math.PI, 'ZXY')),
        position: new THREE.Vector3(0, 1, -0.3),
        scale: 0.001
    });

    controller.use('riggedHand', {
        parent: scene,
        camera: camera,
        positionScale: 2,
        renderFn: null,
        boneColors: function (boneMesh, leapHand) {
            return {
                hue: 0.6,
                saturation: 0.2,
                lightness: 0.8
            };
        }
    });

    controller.use('pinchEvent', {
        pinchThreshold: 0.9,
        grabThreshold: 0.8,
    });

    var cursor = $("a-camera").get(0).components.cursor;
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

    Leap.loop({ background: true }, {
        hand: function (hand) {
            var lastHand = controller.frame(1).hand(hand.id);
            if (!lastHand.valid)
                return;

            // Detect hand movement
            if (hand.palmPosition[0] != lastHand.palmPosition[0] ||
            hand.palmPosition[1] != lastHand.palmPosition[1] ||
            hand.palmPosition[2] != lastHand.palmPosition[2]) {
                controller.emit("handMoved", hand);
            }
        }
    });

    controller.connect();

    return controller;
}