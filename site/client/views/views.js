Template.views.onRendered(function () {
	$(".contextMenu .item").click(function () {
		$( this ).toggleClass( "selected" );
		
		if($( this ).hasClass( "selected" )){
			if($( this ).hasClass( "sagital" )) {
				$( ".viewPlane" ).get(0).emit( "sagital" );
			}
			if($( this ).hasClass( "frontal" )) {
				$( ".viewPlane" ).get(0).emit( "frontal" );
			}
			if($( this ).hasClass( "traverse" )) {
				$( ".viewPlane" ).get(0).emit( "traverse" );
			}
		}
	});
});