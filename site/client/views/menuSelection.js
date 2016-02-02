Template.menuSelection.onRendered(function () {
	$(".menu .item").click(function () {
		$( this ).get(0).setAttribute("color", "black");
		$( this ).get(0).emit('attrchanged', {
			name: "color",
			newData: "black",
			oldData: "yellow",
		});
	});
});