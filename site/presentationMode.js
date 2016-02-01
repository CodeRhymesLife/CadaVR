Events = new Mongo.Collection("events");

if (Meteor.isServer) {
	Meteor.publish("events", function () {
		return Events.find();
	});

	Events.allow({
		insert: function (userId, document) {
			return true;
		},
		
		update: function (userId, document, fieldNames, modifier) {
			return true;
		},
		
		remove: function (userId, document) {
			return true;
		}
	});
	
	Meteor.methods({
		addEvent: function (selector, data) {
			Events.upsert( selector, data );
		}
	});
}
 
if (Meteor.isClient) {
	Meteor.subscribe("events");

	Template.present.onRendered(function () {
		var camera = $( "a-camera" ).get(0);

		var hasSameRotation = function (obj1, obj2) { 
			return JSON.stringify(obj1) === JSON.stringify(obj2);
		}

		var lastCameraRotation;
		var cameraRotation = camera.sceneEl.cameraEl.components.rotation
		function checkCameraRotation () {
			if( !hasSameRotation( lastCameraRotation, cameraRotation.getData() ) ) {
				Meteor.call("addEvent", { name: "camera" }, { name: "camera", rotation: cameraRotation.getData() } );
				lastCameraRotation = cameraRotation.getData();
			}
			
			window.requestAnimationFrame(checkCameraRotation);
		}
		checkCameraRotation();
	});
	
	Template.watchPresentation.onRendered(function () {
		var camera = $( "a-camera" ).get(0);
		
		Tracker.autorun(function () {
			var cameraData = Events.findOne({ name: "camera" });
			if(cameraData != null) {
				camera.setAttribute("rotation", cameraData.rotation);
			}
		});
	});
}