if(Meteor.isClient) {
	Template.index.helpers({
		"views": function () {
			return Views;
		},
	});

	/*AFrame = require('aframe-core');
	AFrame.registerComponent('text', require('aframe-text-component').component);*/
}