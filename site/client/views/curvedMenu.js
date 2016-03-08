var cardContainerClassName = "cardContainer"
Template.curvedMenu.onRendered(function () {
	
	var firstCardHorizontalPosition = 50;
	addCards(firstCardHorizontalPosition);
	addVerticalMenu(firstCardHorizontalPosition + 20);
	attachLookEvents()
});

function addCards(startPos) {
	var cards = [
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
	]

	
	var cardWidth = 40;
	var spaceBetweenCards = 10;
	for(var cardIndex = 0; cardIndex < cards.length; cardIndex++) {
		var card = cards[cardIndex];
		var horizontalPosition = startPos - cardIndex * (cardWidth + spaceBetweenCards);
		DisplayUtils.addCurvedImageToContainer(
			cardContainerClassName,
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
			cardContainerClassName,
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
		var containerElement = $("." + cardContainerClassName).get(0);
		var rotation = containerElement.getAttribute("rotation") || Utils.getDefaultXYZ();
		rotation.y += ( deltaTimeMilliseconds /  1000 ) * speed;
		containerElement.setAttribute("rotation", Utils.xyzString(rotation))
	}
	$(cameraEl).on("lookingLeft", function (e) {
		rotateCards(e.detail.timeDelta, -cardMoveSpeed);
    })
	.on("lookingRight", function (e) {
		rotateCards(e.detail.timeDelta, cardMoveSpeed);
    })
}