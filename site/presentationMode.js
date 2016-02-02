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
		addEvent: function (name, attributeName, data) {
			var insertAttributeModifier = {};
			insertAttributeModifier[attributeName] = data;
			Events.upsert( { name: name }, { $set: insertAttributeModifier } );
		}
	});
}
 
if (Meteor.isClient) {
	Meteor.subscribe("events");

	PresentationMode = {};
	PresentationMode.syncChanges = function () {
		// Sync any object with the sync attribute set
		$( "[sync]" ).on("componentchanged", function (e) {
			var name = $( this ).attr( "sync" );
			var attributeName = e.detail.name;
			var newData = e.detail.newData;
			Meteor.call("addEvent", name, attributeName, newData );
		});
	}
	
	PresentationMode.listenForChanges = function () {
		// Cache that maps an object's data to it's visual element
		var idToObjMap = {};
		
		// Listen for changes on all objects
		var query = Events.find({});
		var handle = query.observeChanges({
			changed: function (id, fields) {
				var aframeObj = idToObjMap[id];
				
				// Find the object if it's not cached
				if(!aframeObj) {
					var name = Events.findOne( id, { fields: { name: 1 } } ).name;
					aframeObj = idToObjMap[id] = $( "[sync='" + name + "']" ).get(0);
				}

				// Set the changed fields on the visual object
				for( key in fields ) {				
					aframeObj.setAttribute( key, fields[key] );
				}
			},
		});
	}
	
	Template.present.onRendered(function () {
		$(".contextMenu .item").click(function () {
			$( this ).toggleClass( "selected" );
			
			if($( this ).hasClass( "selected" )){
				if($( this ).hasClass( "sagital" )) {
					$( "a-sphere a-plane" ).get(0).emit( "sagital" );
				}
				if($( this ).hasClass( "frontal" )) {
					$( "a-sphere a-plane" ).get(0).emit( "frontal" );
				}
				if($( this ).hasClass( "traverse" )) {
					$( "a-sphere a-plane" ).get(0).emit( "traverse" );
				}
			}
		});

		PresentationMode.syncChanges();
	});
	
	Template.watchPresentation1stPerson.onRendered(function () {
		// Disable controls since we're just watching
		$("a-camera").get(0).sceneEl.cameraEl.components["look-controls"].data.enabled = false;
		$("a-camera").get(0).sceneEl.cameraEl.components["wasd-controls"].data.eanbled = false;
		
		PresentationMode.listenForChanges();
	});
	
	Template.watchPresentationOwnPerspective.onRendered(PresentationMode.listenForChanges);
}