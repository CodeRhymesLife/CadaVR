Router.route('/', function () {
  this.render('index');
});

Views = [
	"displayMenu",
	"firstDemo",
    "leapTest",
	"menuSelection",
	"moveObject",
	"neckLesson",
	"operatingTable",
	"pitchPresent",
	"pitchWatch1stPerson",
	"present",
	"views",
	"watchPresentation1stPerson",
	"watchPresentationOwnPerspective",
];

FinalDemoViews = [
	"curvedMenu",
	"heartLesson",
]

Views.forEach( function (page) {
	Router.route('/' + page, function () {
		this.layout('viewLayout');
		this.render(page);
	});
});

FinalDemoViews.forEach( function (page) {
	Router.route('/' + page, function () {
		this.layout('finalDemoLayout');
		this.render(page);
	});
});