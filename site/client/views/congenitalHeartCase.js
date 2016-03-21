
Template.congenitalHeartCase.onRendered(function () {
	Utils.waitForScene(function () {
        setupController();
    });
	
	$(".organPart").on('model-loaded', function () {
		Utils.resize( $(this).get(0), 1 );
	});
});

function setupController() {
    var controller = LeapUtils.createController();
	controller.use("rotateAndZoom", { container: $(".organContainer").get(0) });
}