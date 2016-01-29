Template.views.onRendered(function () {
	$(".contextMenu .item").click(function () {
		$( this ).toggleClass( "selected" );
		
		if($( this ).hasClass( "selected" )){
			if($( this ).hasClass( "sagital" )) {
				$( "a-sphere a-plane" ).get(0).emit( "sagital" );
			}
			if($( this ).hasClass( "frontal" )) {
				$( "a-sphere a-plane" ).get(0).emit( "frontal" );
			}
			if($( this ).hasClass( "traverse" )) {
				$( "a-sphere a-plane" ).get(0).emit( "traverse" );
			}
		}
	});
});