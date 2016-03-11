Template.finalDemo.onRendered(function () {
    Utils.waitForScene(function () {
        // Hide the heart lesson items by default
        setVisibility(".heartLessonMenuContainer, .heartLessonCurvedImageContainer, .hud", false);

        // When the cadavr card is clicked hide the navigation menu and show the heart lesson
        $(".heartCard").click(function () {
            setVisibility(".navigationMenuContainer, .cardContainer, .verticalButtonsContainer, .organCardContainerClassName", false);

            setVisibility(".heartLessonMenuContainer, .heartLessonCurvedImageContainer, .hud", true);
        })
    });
});

function setVisibility (selector, visibility) {
	$( selector ).each( function () {
		$( this ).get(0).setAttribute( "visible", visibility.toString() );
	})
}