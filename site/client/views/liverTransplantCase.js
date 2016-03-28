var colors = {
    duct: "green",
    artery: "red",
    veins: "blue",
    liver: "orange",
}

var liverPartInfo = {
    folder: "models/realCases/liverTransplantCase/",
    parts: [{
        "file": "bile ducts.obj",
        "name": "bile ducts",
        "color": colors.duct,
    },
	{
	    "file": "hepatic artery.obj",
	    "name": "hepatic artery",
	    "color": colors.artery,
	},
	{
	    "file": "hepatic veins.obj",
	    "name": "hepatic veins",
	    "color": colors.veins,
	},
	{
	    "file": "Liver.001.obj",
	    "name": "Liver.001",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.002.obj",
	    "name": "Liver.002",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.003.obj",
	    "name": "Liver.003",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.004.obj",
	    "name": "Liver.004",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.005.obj",
	    "name": "Liver.005",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.006.obj",
	    "name": "Liver.006",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.007.obj",
	    "name": "Liver.007",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.008.obj",
	    "name": "Liver.008",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.009.obj",
	    "name": "Liver.009",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.obj",
	    "name": "Liver",
	    "color": colors.liver,
	},
	{
	    "file": "Liver.010.obj",
	    "name": "Liver.010",
	    "color": colors.liver,
	}]
}

Template.liverTransplantCase.onRendered(function () {
	Utils.waitForScene(function () {
	    var controller = LeapUtils.createController();
	    ModelUtils.load(liverPartInfo, ".organContainer", controller, 2);
	    controller.use("pointer", { debug: true });
    });
});