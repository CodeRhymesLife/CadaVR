Template.finalDemo.onRendered(function () {
	// Hide the heart lesson items by default
	setVisibility( ".heartLessonMenuContainer, .heartLessonCurvedImageContainer, .hud", false );
	
	// When the cadavr card is clicked hide the navigation menu and show the heart lesson
	$( ".cadavrCard" ).click( function () {
		setVisibility( ".navigationMenuContainer, .cardContainer", false );
		
		setVisibility( ".heartLessonMenuContainer, .heartLessonCurvedImageContainer, .hud", true );
	})
});

function setVisibility (selector, visibility) {
	$( selector ).each( function () {
		$( this ).get(0).setAttribute( "visible", visibility.toString() );
	})
}