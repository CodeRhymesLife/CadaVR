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
	var slides = [
		"intro.png",
		"accomplishments.png",
		"menuSelection.png",
		"objectInteraction.png",
		"summaryOfFindings.png",
		"team.png",
		"cadavrMockup.png",
	];
	
	var currentSlide = 0;
	var showSlide = function (slideIndex) {
		// Make sure we're in range
		if(slideIndex < 0 || slideIndex > slides.length - 1)
			return;
		
		var slidesEl = $(".slideShow .slides").get(0);
		var oldSrc = slidesEl.getAttribute("src");
		slidesEl.setAttribute("src", "images/pitch/" + slides[slideIndex]);

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
	
	$(".slideShow .next, .slideShow .slides").click( function () {
		showSlide(currentSlide + 1);
	});
	
	var srcChangeHandlers = {
		"images/pitch/menuSelection.png": {
			newDataHandler: function () {
				$( ".menuSelectionContainer" ).get(0).emit( "forwardAnimation" )
			},
			oldDataHandler: function () {
				$( ".menuSelectionContainer" ).get(0).emit( "backwardAnimation" )
			},
		},
		
		"images/pitch/objectInteraction.png": {
			newDataHandler: function () {
				$( ".objectInteractionContainer" ).get(0).emit( "forwardAnimation" )
			},
			oldDataHandler: function () {
				$( ".objectInteractionContainer" ).get(0).emit( "backwardAnimation" )
			},
		}
	}	
	$("body").on("attrchanged", ".slideShow .slides", function (e) {
		if(e.detail.name != "src")
			return;
		
		var newData = e.detail.newData;
		if(srcChangeHandlers[newData])
			srcChangeHandlers[newData].newDataHandler();
		
		var oldData = e.detail.oldData;
		if(srcChangeHandlers[oldData])
			srcChangeHandlers[oldData].oldDataHandler();
	});
	
	showSlide(currentSlide);
}
