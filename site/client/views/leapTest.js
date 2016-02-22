Template.leapTest.onRendered(function () {
    var sceneEl = $("a-scene").get(0);
    var scene = sceneEl.object3D;
    var renderer = sceneEl.renderer;
    var camera = sceneEl.cameraEl.components.camera.camera;
    var handsContainer = $(".handsContainer").get(0).object3D;

    var baseBoneRotation = (new THREE.Quaternion).setFromEuler(
        new THREE.Euler(Math.PI / 2, 0, 0)
    );

    Leap.loop({ background: true }, {
        hand: function (hand) {

            hand.fingers.forEach(function (finger) {

                // This is the meat of the example - Positioning `the cylinders on every frame:
                finger.data('boneMeshes').forEach(function (mesh, i) {
                    var bone = finger.bones[i];

                    mesh.position.fromArray(bone.center());

                    mesh.setRotationFromMatrix(
                        (new THREE.Matrix4).fromArray(bone.matrix())
                    );

                    mesh.quaternion.multiply(baseBoneRotation);
                });

                finger.data('jointMeshes').forEach(function (mesh, i) {
                    var bone = finger.bones[i];

                    if (bone) {
                        mesh.position.fromArray(bone.prevJoint);
                    } else {
                        // special case for the finger tip joint sphere:
                        bone = finger.bones[i - 1];
                        mesh.position.fromArray(bone.nextJoint);
                    }

                });

            });

            renderer.render(scene, camera);

        }
    })
      // these two LeapJS plugins, handHold and handEntry are available from leapjs-plugins, included above.
      // handHold provides hand.data
      // handEntry provides handFound/handLost events.
    .use('handHold')
    .use('handEntry')
    .on('handFound', function (hand) {

        hand.fingers.forEach(function (finger) {

            var boneMeshes = [];
            var jointMeshes = [];

            finger.bones.forEach(function (bone) {

                // create joints

                // CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
                var boneMesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(1, 1, bone.length),
                    new THREE.MeshPhongMaterial()
                );

                boneMesh.material.color.setHex(0xffffff);
                handsContainer.add(boneMesh);
                boneMeshes.push(boneMesh);
            });

            for (var i = 0; i < finger.bones.length + 1; i++) {

                var jointMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(8),
                    new THREE.MeshPhongMaterial()
                );

                jointMesh.material.color.setHex(0x0088ce);
                handsContainer.add(jointMesh);
                jointMeshes.push(jointMesh);

            }


            finger.data('boneMeshes', boneMeshes);
            finger.data('jointMeshes', jointMeshes);

        });

    })
    .on('handLost', function (hand) {

        hand.fingers.forEach(function (finger) {

            var boneMeshes = finger.data('boneMeshes');
            var jointMeshes = finger.data('jointMeshes');

            boneMeshes.forEach(function (mesh) {
                handsContainer.remove(mesh);
            });

            jointMeshes.forEach(function (mesh) {
                handsContainer.remove(mesh);
            });

            finger.data({
                boneMeshes: null,
                boneMeshes: null
            });

        });

        renderer.render(scene, camera);

    })
    .use('playback', {
        // This is a compressed JSON file of preprecorded frame data
        recording: './scroll-and-swipe-100fps.json.lz',
        // How long, in ms, between repeating the recording.
        timeBetweenLoops: 2000,
        pauseOnHand: true
    })
    .connect();
});