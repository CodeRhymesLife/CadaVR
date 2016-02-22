Template.leapTest.onRendered(function () {
    var sceneEl = $("a-scene").get(0);
    var scene = sceneEl.object3D;
    var camera = sceneEl.cameraEl.components.camera.camera;

    window.controller = controller = new Leap.Controller({
        host: Cookies.get('leapHost'),
        background: true,
        optimizeHMD: true
    });

    controller.use('transform', {
        quaternion: (new THREE.Quaternion).setFromEuler(new THREE.Euler(Math.PI * -0.3, 0, Math.PI, 'ZXY')),
        position: new THREE.Vector3(0, 1.2, -0.3),
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

    controller.connect();
});