Template.pitchPresent.onRendered(function () {
	loadPitch();
	PresentationMode.syncChanges();
});

Template.pitchWatch1stPerson.onRendered(function () {
	loadPitch();
	PresentationMode.disableControls();
	PresentationMode.listenForChanges();
});

function loadPitch () {
	var showUserTest = function (selector) {
		return function () {
			$( selector ).get(0).setAttribute("visible", true);
		}
	}
	
	var slides = [
		{
			image: "vrlearning.png",
		},
		{
			image: "cadavr.png",
		},
		{
			image: "menuSelection.png",
			onLoad: showUserTest(".menuSelectionContainer")
		},
		{
			image: "objectInteraction.png",
			onLoad: showUserTest(".objectInteractionContainer")
		},
		{
			image: "team.png",
		},
	];
	
	var currentSlide = 0;
	var showSlide = function (slideIndex) {
		// Make sure we're in range
		if(slideIndex < 0 || slideIndex > slides.length - 1)
			return;

		var slideImage = slides[slideIndex].image;
		var onLoad = slides[slideIndex].onLoad;
		
		var slidesEl = $(".slideShow a-image.slides").get(0);
		var oldSrc = slidesEl.getAttribute("src");
		slidesEl.setAttribute("src", "images/pitch/" + slideImage);
		
		if(onLoad)
			onLoad();
		
		// Non components don't fire events when attributes change, so we need to do it ourselves
		slidesEl.emit('attrchanged', {
			name: "src",
			newData: slidesEl.getAttribute("src"),
			oldData: oldSrc,
		})
		currentSlide = slideIndex;
	}
	
	$(".slideShow .previous").click( function () {
		showSlide(currentSlide - 1);
	});
	
	$(".slideShow .next").click( function () {
		showSlide(currentSlide + 1);
	});
	
	showSlide(currentSlide);
}
