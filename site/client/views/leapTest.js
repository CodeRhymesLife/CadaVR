var controller = null;
Template.leapTest.onRendered(function () {
    Utils.waitForScene(function () {
        controller = LeapUtils.createController();
        controller.use("rigged-hand-touch", { debug: true });
    });

    $("a-box").on("stateadded", function (e) {
        if (e.detail.state != "hand.grabbing")
            return;

        $("a-box").get(0).setAttribute("material", "color", getRandomColor());
        ungrab($(this).get(0))
        grab($(this).get(0))
    })
    
    $("a-box").on("stateremoved", function (e) {
        if (e.detail.state != "hand.grabbing")
            return;

        $("a-box").get(0).setAttribute("material", "color", getRandomColor());
        ungrab($(this).get(0))
    })
});

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var grab = function (element) {
    var position = element.object3D.getWorldPosition()
    Utils.sceneEl.object3D.updateMatrixWorld();
    THREE.SceneUtils.attach(element.object3D, Utils.sceneEl.object3D, controller.frame(0).hands[0].data("riggedHand.mesh"));
    //element.object3D.position.copy(position);
}

var ungrab = function (element) {
    element.object3D.parent.updateMatrixWorld();
    THREE.SceneUtils.detach(element.object3D, element.object3D.parent, Utils.sceneEl.object3D);
}