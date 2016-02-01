if(Meteor.isClient) {
	Template.index.helpers({
		"views": function () {
			return Views;
		},
	});
}