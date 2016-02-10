Template.firstDemo.onRendered(function () {
	$( "body" ).on("click", ".card", function () {
		$( ".menuContainer" ).get(0).emit("loadLesson", {});
		
		$( ".lessonContainer" ).get(0).setAttribute("visible", "true");
		$( ".lessonContainer" ).get(0).emit("loadLesson", {});
	});
});