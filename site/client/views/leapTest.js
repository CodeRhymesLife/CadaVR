Template.leapTest.onRendered(function () {
    Utils.waitForScene(function () {
        var controller = LeapUtils.createController();
        controller.use("rotateAndZoom", { container: $("a-box").get(0) });
        controller.use("pointer", { debug: true });
    });

    $("a-box").on("stateadded", function (e) {
        if (e.detail.state != "hovered")
            return;

        $("a-box").get(0).setAttribute("material", "color", getRandomColor());
    })

    var small = true;
    $("a-box").on("pointerTouch", function (e) {
        var scale = small ? "0.01 0.01 0.01" : "0.1 0.1 0.1";
        small = !small;
        $("a-box").get(0).setAttribute("scale", scale);
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