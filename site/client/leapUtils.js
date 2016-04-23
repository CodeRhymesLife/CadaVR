LeapUtils = {};
LeapUtils.createController = function () {
    var sceneEl = $("a-scene").get(0);
    var scene = sceneEl.object3D;
    var camera = sceneEl.camera;

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

	var handContainer = new THREE.Group;
	handContainer.scale.set(2, 2, 2);
    handContainer.position.set(0, -0.8, 0);
	scene.add(handContainer);
	scene.updateMatrixWorld();
    THREE.SceneUtils.attach(handContainer, scene, camera);
	
    controller.use('riggedHand', {
        parent: handContainer,
        camera: camera,
        positionScale: 1,
        renderFn: null,
        boneColors: function (boneMesh, leapHand) {
            return {
                hue: 0.6,
                saturation: 0.2,
                lightness: 0.8
            };
        }
    });

    controller.connect();

    return controller;
}