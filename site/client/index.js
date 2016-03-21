if(Meteor.isClient) {
	Template.index.helpers({
		"views": function () {
			return Views;
		},
		
		"finalDemoViews": function () {
			return FinalDemoViews;
		},
		
		"caseViews": function () {
			return CaseViews;
		},
	});

	Template.index.onRendered(function () {
	    // Allow the user to set where the leap controller data comes from
	    /*
            Note: the host computer, if not localhost, needs to allow connections from other computers
                To do this, the host computer needs to stop all leap services, then run the following command:

                Windows:
                    LeapSvc --websockets_allow_remote=true --websockets_enabled=true --run

                Mac & Linux:
                    leapd --websockets_allow_remote=true --websockets_enabled=true --run
        */
	    var leapHost = Cookies.get('leapHost');
	    if (!leapHost)
	        leapHost = Cookies.set('leapHost', "localhost");

	    $(".leapHost").val(leapHost);
	    $(".leapHost").change(function () {
	        Cookies.set('leapHost', $(this).val());
	    });
	});
}