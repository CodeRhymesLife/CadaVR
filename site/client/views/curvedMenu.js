var cardContainerClassName = "cardContainer"
Template.curvedMenu.onRendered(function () {
	
	addCards();
	attachLookEvents()
});

function addCards() {
	var cards = [
		{
			className: "cadavrCard",
			src: "images/curvedMenu/cadavrCard.png",
		},
		{
			className: "astronomyCard",
			src: "images/curvedMenu/astronomyCard.png",
		},
		{
			className: "historyCard",
			src: "images/curvedMenu/historyCard.png",
		},
		{
			className: "physicsCard",
			src: "images/curvedMenu/physicsCard.png",
		},
	]

	var firstCardHorizontalPosition = 50;
	var cardWidth = 40;
	var spaceBetweenCards = 10;
	for(var cardIndex = 0; cardIndex < cards.length; cardIndex++) {
		var card = cards[cardIndex];
		var horizontalPosition = firstCardHorizontalPosition - cardIndex * (cardWidth + spaceBetweenCards);
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