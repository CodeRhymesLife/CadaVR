var colors = {
    heart: "#DD0000",
    front: "#336699",
    left: "#ff8181",
    right: "orange",
}

var congenitalHeartPartsInfo = {
    folder: "models/realCases/congenitalHeartCase/",
    parts: [
        {
            "name": "heart",
            "file": "heart.obj",
            "color": colors.heart,
        },
	    {
	        "name": "heart removable front.001",
	        "file": "heart removable front.001.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front.002",
	        "file": "heart removable front.002.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front.003",
	        "file": "heart removable front.003.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front.004",
	        "file": "heart removable front.004.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front.005",
	        "file": "heart removable front.005.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front.006",
	        "file": "heart removable front.006.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front.007",
	        "file": "heart removable front.007.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front.008",
	        "file": "heart removable front.008.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front.009",
	        "file": "heart removable front.009.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front.010",
	        "file": "heart removable front.010.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "heart removable front",
	        "file": "heart removable front.obj",
	        "color": colors.front,
	    },
	    {
	        "name": "left atrium.001",
	        "file": "left atrium.001.obj",
	        "color": colors.left,
	    },
	    {
	        "name": "left atrium",
	        "file": "left atrium.obj",
	        "color": colors.left,
	    },
	    {
	        "name": "left atrium.002",
	        "file": "left atrium.002.obj",
	        "color": colors.left,
	    },
	    {
	        "name": "right atrium",
	        "file": "right atrium.obj",
	        "color": colors.right,
	    },
	    {
	        "name": "right atrium.001",
	        "file": "right atrium.001.obj",
	        "color": colors.right,
	    },
	    {
	        "name": "right atrium.002",
	        "file": "right atrium.002.obj",
	        "color": colors.right,
	    },
	    {
	        "name": "right atrium.003",
	        "file": "right atrium.003.obj",
	        "color": colors.right,
	    },
	    {
	        "name": "right atrium.004",
	        "file": "right atrium.004.obj",
	        "color": colors.right,
	    },
	    {
	        "name": "right atrium.005",
	        "file": "right atrium.005.obj",
	        "color": colors.right,
	    },
	    {
	        "name": "right atrium.006",
	        "file": "right atrium.006.obj",
	        "color": colors.right,
	    },
	    {
	        "name": "right atrium.007",
	        "file": "right atrium.007.obj",
	        "color": colors.right,
	    }
    ],
};

Template.congenitalHeartCase.onRendered(function () {
	Utils.waitForScene(function () {
	    var controller = LeapUtils.createController();
	    ModelUtils.load(congenitalHeartPartsInfo, ".organContainer", controller)
	    controller.use("rotateAndZoom", { container: $(".organContainer").get(0) });
    });
	
	$(".organContainer").on('models-loaded', function () {
		Utils.resize( $(this).get(0), 0.5 );
	});
});