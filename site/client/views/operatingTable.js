Template.operatingTable.onRendered(function () {
	$(".source, .contextMenu .item").click(function () {
		$( this ).attr("color", "black");
	});
});