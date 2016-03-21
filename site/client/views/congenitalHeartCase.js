
Template.congenitalHeartCase.onRendered(function () {
	$(".organPart").on('model-loaded', function () {
		Utils.resize( $(this).get(0), 1 );
	});
});