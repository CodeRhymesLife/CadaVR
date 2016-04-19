var cardContainerClassName = "cardContainer"
var verticalButtonsContainerClassName = "verticalButtonsContainer"
var organCardContainerClassName = "organCardContainerClassName"
Template.curvedMenu.onRendered(function () {
	var subjectCards = [
		{
			className: "cadavrCard",
			src: "images/curvedMenu/cards/cadavrCard.png",
		},
		{
			className: "astronomyCard",
			src: "images/curvedMenu/cards/astronomyCard.png",
		},
		{
			className: "historyCard",
			src: "images/curvedMenu/cards/historyCard.png",
		},
		{
			className: "physicsCard",
			src: "images/curvedMenu/cards/physicsCard.png",
		},
	];
    
    var organCards = [
		{
			className: "lungsCard",
			src: "images/curvedMenu/cards/lungsCard.png",
		},
		{
			className: "stomachCard",
			src: "images/curvedMenu/cards/stomachCard.png",
		},
		{
			className: "heartCard",
			src: "images/curvedMenu/cards/heartCard.png",
		},
		{
			className: "pelvisCard",
			src: "images/curvedMenu/cards/pelvisCard.png",
		},
	];
    
    Utils.waitForScene(function () {
        var firstCardHorizontalPosition = 50;
        addCards(firstCardHorizontalPosition, cardContainerClassName, subjectCards);
        
        addCards(firstCardHorizontalPosition, organCardContainerClassName, organCards);
        $("." + organCardContainerClassName).get(0).setAttribute("visible", "false")
        
        addVerticalMenu(firstCardHorizontalPosition + 20);
        attachLookEvents();
        
        $(".cadavrCard").click(function () {
            $("." + cardContainerClassName).get(0).setAttribute("visible", "false")
            $("." + organCardContainerClassName).get(0).setAttribute("visible", "true")
        })
    });
});

function addCards(startPos, containerClassName, cards) {
	var cardWidth = 40;
	var spaceBetweenCards = 10;
	for(var cardIndex = 0; cardIndex < cards.length; cardIndex++) {
		var card = cards[cardIndex];
		var horizontalPosition = startPos - cardIndex * (cardWidth + spaceBetweenCards);
		DisplayUtils.addCurvedImageToContainer(
			containerClassName,
			"lessonCard " + card.className,
			card.src,
			"0 0 0",
			"0 " + horizontalPosition + " 0",
			3.8,
			1674,
			2074
		);
	}
}

function addVerticalMenu(startPos) {
	var buttons = [
		"images/curvedMenu/personButton.png",
		"images/curvedMenu/cloudButton.png",
		"images/curvedMenu/notifButton.png",
	];
	
	var firstButtonVerticalPosition = 17;
	var buttonWidth = 0.8;
	var spaceBetweenButtons = 15;
	for(var buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
		var buttonSrc = buttons[buttonIndex];
		var verticalPosition = firstButtonVerticalPosition - buttonIndex * (buttonWidth + spaceBetweenButtons);
		DisplayUtils.addCurvedImageToContainer(
			verticalButtonsContainerClassName,
			"menuButton",
			buttonSrc,
			"0 0 0",
			verticalPosition + " " + startPos + " 0",
			buttonWidth,
			668,
			668
		);
	}
}

function attachLookEvents() {
	// Add animations to card conainer
	var cameraEl = CameraUtils.setupLookEvents();
	var cardMoveSpeed = 30 // m/s
	var rotateCards = function (deltaTimeMilliseconds, speed) {
        $("." + cardContainerClassName + ", ." + verticalButtonsContainerClassName + ", ." + organCardContainerClassName).each(function () {
            var containerElement = $( this ).get(0);
            var rotation = containerElement.getAttribute("rotation") || Utils.getDefaultXYZ();
            rotation.y += ( deltaTimeMilliseconds /  1000 ) * speed;
            containerElement.setAttribute("rotation", Utils.xyzString(rotation))
        })
	}
	$(cameraEl).on("lookingLeft", function (e) {
		rotateCards(e.originalEvent.detail.timeDelta, -cardMoveSpeed);
    })
	.on("lookingRight", function (e) {
		rotateCards(e.originalEvent.detail.timeDelta, cardMoveSpeed);
    })
}