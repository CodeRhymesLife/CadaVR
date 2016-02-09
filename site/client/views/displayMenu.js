Template.displayMenu.onRendered(function () {
	$(document).ready(function() {

		var menu = ['Pin Tests', 'Organ', 'Lessons', 'Collaborate'];
		var lowerBound = 0;
		var upperBound = menu.length;
		var position = 0;
		/*$(".pins").on({
			mouseenter: function() {
			// on hover
				$('.pin').get(0).setAttribute("scale", "0.6 0.6 0.6")
			},
			mouseleave: function() {
			// on leave
				$('.organ').get(0).setAttribute("scale", "0.3 0.3 0.3")
			}
		});*/

		$('.pins').click(function() {
			$('.underline').remove();
			$('.plane').append('<a-entity class="underline" position="-2.8 -0.1 0" text="text: _______" scale="0.3 0.3 0.3"></a-entity>');
			console.log("clicked");
			moveUp();
		});

		$('.organ').click(function() {
			$('.underline').remove();
			$('.plane').append('<a-entity class="underline" position="-1.3 -0.1 0" text="text: _______" scale="0.3 0.3 0.3"></a-entity>');
			console.log("clicked");
			moveUp();
			for (var i = 1; i <= menu.length; i++) {
				// unsure why, but if we just use -2
				// the first card wouldn't be appended in
				var location = "" + (-4 + 2.2 * i);
				console.log(location);
				$('.card').append('<a-plane color="red" class="plane" position="' + location + '0 0" width="2" height="3"></a-plane>');
				console.log($('card'));
			}
		});

		$('.left').click(function() {
			console.log(position);
			if (position < upperBound) {
				moveCards(-0.2);
			}	
			if (position > upperBound) {
				position = upperBound;
			}
		});
		$('.farLeft').click(function() {
			console.log(position);
			console.log('far left');
			if (position < upperBound) {
				moveCards(-0.4);
			}	
			if (position > upperBound) {
				position = upperBound;
			}
		});
		$('.right').click(function() {
			console.log(position);
			console.log('right');
			if (position > lowerBound) {
				moveCards(0.2);
			}	
			if (position < lowerBound) {
				position = lowerBound;
			}
		});
		$('.farRight').click(function() {
			console.log(position);
			console.log('far right');
			if (position > lowerBound) {
				moveCards(0.4);
			}	
			if (position < lowerBound) {
				position = lowerBound;
			}
		});

		function moveUp() {
			var size = $('.menu')[0].getAttribute('position');
			$('.menu')[0].setAttribute('position', "" + size.x + " " + (size.y + 2) + " " + size.z);
			console.log($('.menu')[0].getAttribute('position'));
		}

		function moveCards(value) {
			for (var i = 0; i < $('.card').children().length; i++) {
				var obj = $('.card').children()[i];
				var size = $(obj)[0].getAttribute('position');
				$(obj)[0].setAttribute('position', '' + (size.x + value) + ' ' + size.y + ' ' + size.z );	
			}
			position -= value;
			console.log(position);
		}

		console.log($('.organ')[0].getAttribute('scale'));
	


		var dragging;
		var scene = $("a-scene").get(0)
		var camera = $("a-scene").get(0).cameraEl;

	});
});