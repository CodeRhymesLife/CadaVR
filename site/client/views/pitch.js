Template.pitch.onRendered(function () {
	var slides = [
		"vrlearning.png",
		"cadavr.png",
		"team.png",
	];
	
	var currentSlide = 0;
	var showSlide = function (slideIndex) {
		// Make sure we're in range
		if(slideIndex < 0 || slideIndex > slides.length - 1)
			return;

		$(".slideShow a-image.slides").get(0).setAttribute("src", "images/pitch/" + slides[slideIndex]);
		currentSlide = slideIndex;
	}
	
	$(".slideShow .previous").click( function () {
		showSlide(currentSlide - 1);
	});
	
	$(".slideShow .next").click( function () {
		showSlide(currentSlide + 1);
	});
	
	showSlide(currentSlide);
});
