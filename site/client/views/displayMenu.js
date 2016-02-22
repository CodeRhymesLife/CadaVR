Template.displayMenu.onRendered(function () {

	document.querySelector("#menu").addEventListener('mouseenter', function() {
		console.log("menu clicked");
	});

	$(document).ready(function() {

		var menu = ['Pin Tests', 'Organ', 'Lessons', 'Collaborate'];
		var lowerBound = -menu.length;
		var upperBound = menu.length;
		var position = 0;
		var usingCards = false;

		var cards = {
			pinTests: [
				{
					title: "Lesson 1",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 2",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 3",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 4",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
			],
			organs: [
				{
					title: "Lesson 1",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 2",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 3",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 4",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
			],
			lessons: [
				{
					title: "Lesson 1",
					body: "Learn about the muscles of the neck",
				},
				{
					title: "Lesson 2",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 3",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 4",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
			],
			collaborate: [
				{
					title: "Lesson 1",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 2",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 3",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
				{
					title: "Lesson 4",
					body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				},
			],
		}
		
		var lessonTitle = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'];
		var lessonBody = ["Do something fun I guess?", "Do more fun things!", "Even more fun things!", "the most fun things!"];

		$('.pins').click(function() {
			$('.underline').remove();
			$('.plane').append('<a-entity class="underline" position="-2.8 -0.1 0" text="text: _______" mixin="underlineColor" scale="0.3 0.3 0.3"></a-entity>');
			console.log("clicked");
			moveUp(cards["pinTests"]);
		});

		$('.organ').click(function() {
			$('.underline').remove();
			$('.plane').append('<a-entity class="underline" position="-1.3 -0.1 0" text="text: _______" mixin="underlineColor" scale="0.3 0.3 0.3"></a-entity>');
			console.log("clicked");
			moveUp(cards["organs"]);
		});

		$('#lesson').click(function() {
			$('.underline').remove();
			$('.plane').append('<a-entity class="underline" position="0 -0.1 0" text="text: _______" mixin="underlineColor" scale="0.3 0.3 0.3"></a-entity>');
			console.log("clicked");
			moveUp(cards["lessons"]);
		});

		$('#collaborate').click(function() {
			$('.underline').remove();
			$('.plane').append('<a-entity class="underline" position="1.5 -0.1 0" text="text: _______" mixin="underlineColor" scale="0.3 0.3 0.3"></a-entity>');
			console.log("clicked");
			moveUp(cards["collaborate"]);
		});


		$('.left').click(function() {
			if (usingCards) {
				console.log(position);
				if (position < upperBound) {
					moveCards(0.1);
				}	
				if (position > upperBound) {
					position = upperBound;
				}		
			}
		});
		document.querySelector(".left").addEventListener('mouseenter', function() {
			console.log("menu clicked");
			this.iid = setInterval(function() {
				if (usingCards) {
					console.log(position);
					if (position < upperBound) {
						moveCards(0.1);
					}	
					if (position > upperBound) {
						position = upperBound;
					}		
				}
			}, 100);
		});

		document.querySelector(".left").addEventListener('mouseleave', function() {
			console.log('clear');
			clearInterval(this.iid);
			this.iid = null;
		});

		document.querySelector(".farLeft").addEventListener('mouseenter', function() {
			console.log("menu clicked");
			this.iid = setInterval(function() {
				if (usingCards) {
					console.log(position);
					if (position < upperBound) {
						moveCards(0.2);
					}	
					if (position > upperBound) {
						position = upperBound;
					}		
				}
			}, 100);
		});

		document.querySelector(".farLeft").addEventListener('mouseleave', function() {
			console.log('clear');
			clearInterval(this.iid);
			this.iid = null;
		});

		$('.right').click(function() {
			if (usingCards) {
				console.log(position);
				console.log('right');
				if (position > lowerBound) {
					moveCards(-0.1);
				}	
				if (position < lowerBound) {
					position = lowerBound;
				}
			}
		});

		document.querySelector(".right").addEventListener('mouseenter', function() {
			console.log("menu clicked");
			this.iid = setInterval(function() {
				if (usingCards) {
					console.log(position);
					console.log('right');
					if (position > lowerBound) {
						moveCards(-0.1);
					}	
					if (position < lowerBound) {
						position = lowerBound;
					}
				}
			}, 100);
		});

		document.querySelector(".right").addEventListener('mouseleave', function() {
			console.log('clear');
			clearInterval(this.iid);
			this.iid = null;
		});


		$('.farRight').click(function() {
			if (usingCards) {
				console.log(position);
				console.log('far right');
				if (position > lowerBound) {
					moveCards(-0.2);
				}	
				if (position < lowerBound) {
					position = lowerBound;
				}
			}
		});

		document.querySelector(".farRight").addEventListener('mouseenter', function() {
			console.log("menu clicked");
			this.iid = setInterval(function() {
				if (usingCards) {
					console.log(position);
					console.log('right');
					if (position > lowerBound) {
						moveCards(-0.2);
					}	
					if (position < lowerBound) {
						position = lowerBound;
					}
				}
			}, 100);
		});

		document.querySelector(".farRight").addEventListener('mouseleave', function() {
			console.log('clear');
			clearInterval(this.iid);
			this.iid = null;
		});

		function moveUp(cardsInfo) {
			// only move up for the first time
			if (!usingCards) {
				console.log(cardsInfo);
				var size = $('.menu')[0].getAttribute('position');
				$('.menu')[0].setAttribute('position', "" + size.x + " " + (size.y + 0.5) + " " + size.z);
				console.log($('.menu')[0].getAttribute('position'));
				
				// move the card transparent control foward
				$('.left')[0].setAttribute('position', '-2 0 -2.9');
				$('.farLeft')[0].setAttribute('position', '-3 0 -2.9');
				$('.right')[0].setAttribute('position', '2 0 -2.9');
				$('.farRight')[0].setAttribute('position', '3 0 -2.9');
				usingCards = true;
			}			
			// clear cards first
			$('.cards').empty();

			// add new cards
			for (var i = 1; i <= cardsInfo.length; i++) {
				// unsure why, but if we just use -2
				// the first card wouldn't be appended in
				var html = "";
				var location = "" + (-6 + 2.4 * i);
				console.log(location);
				html += '<a-plane color="white" class="card" position="' + location + ' 0.5 0" width="2" height="2">';
				html += '<a-mouseenter scale="1.1 1.1 1.1"></a-mouseenter>';
				html += '<a-mouseleave scale="1 1 1"></a-mouseleave>';
				html += '<a-entity position="-0.9 0.7 0" scale="0.35 0.35 0.35" text="text: ' + cardsInfo[i - 1].title + '" mixin="textColor"> </a-entity>';
				var body = cardsInfo[i - 1].body.split(" ");
				var numAppended = 0;
				var str = "";

				// creates seperate line for the body with 
				// 15 char max for each line
				for (var j = 0; j < body.length; j++) {
					if (str.length + body[j].length + 1 <= 15) {
						str += " " + body[j];
					} else {
						var newSpace = (0.3 - (0.25 * numAppended));
						html += '<a-entity position="-0.9 ' + 
							newSpace + ' 0" scale="0.3 0.3 0.3" text="text: ' + 
							str + '" mixin="textColor"></a-entity>';
						numAppended += 1;
						str = body[j];
					}
				}
				if (str.length != 0) {
					html += '<a-entity position="-0.9 ' + (0.3 - (0.25 * numAppended)) + ' 0" scale="0.3 0.3 0.3" text="text: ' + str + '" mixin="textColor"> </a-entity>';
				}
				html += '</a-plane>';
				$('.cards').append(html);
				console.log($('card'));
			}
		}

		function moveCards(value) {
			for (var i = 0; i < $('.cards').children().length; i++) {
				var obj = $('.cards').children()[i];
				var size = $(obj)[0].getAttribute('position');
				$(obj)[0].setAttribute('position', '' + (size.x + value) + ' ' + size.y + ' ' + size.z );	
			}
			position += value;
			console.log(position);
		}

		console.log($('.organ')[0].getAttribute('scale'));
		
		// Show the pins by default
		$('.pins').click();


		var controller = LeapUtils.createController();
		controller.on("gesture", function (gesture) {
		    switch (gesture.type) {
		        case "circle":
		            console.log("Circle Gesture");
		            break;
		        case "keyTap":
		            console.log("Key Tap Gesture");
		            break;
		        case "screenTap":
		            console.log("Screen Tap Gesture");
		            break;
		        case "swipe":
		            // Classify swipe as either horizontal or vertical
		            var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

		            // Classify as right-left or up-down
		            if (isHorizontal) {
		                if (gesture.direction[0] > 0) {
		                    swipeDirection = "right";
		                } else {
		                    swipeDirection = "left";
		                }

		                var vector = swipeDirection == "left" ? -0.2 : 0.2;
		                var speed = gesture.speed * 0.001;
		                moveCards(vector * speed);
		            } else { //vertical
		                if (gesture.direction[1] > 0) {
		                    swipeDirection = "up";
		                } else {
		                    swipeDirection = "down";
		                }
		            }

		            console.log(swipeDirection)
		            break;
		    }
		});
	});
});