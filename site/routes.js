Router.route('/',
    function () {
      this.render('index');
    },
    { name: "index" });

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
	"finalDemo",
]

CaseViews = [
	"congenitalHeartCase",
	"liverTransplantCase",
]

CadaverLabViews = [
	"heartLesson",
	"playground",
]

Views.forEach( function (page) {
    Router.route('/' + page,
        function () {
		    this.layout('viewLayout');
		    this.render(page);
        },
        { name: page });
});

FinalDemoViews.forEach( function (page) {
    Router.route('/' + page,
        function () {
		    this.layout('finalDemoLayout');
		    this.render(page);
        },
        { name: page });
});

CaseViews.forEach( function (page) {
    Router.route('/' + page,
        function () {
		    this.layout('casesLayout');
		    this.render(page);
        },
        { name: page });
});

CadaverLabViews.forEach( function (page) {
    Router.route('/' + page,
        function () {
		    this.layout('cadaverLabLayout');
		    this.render(page);
        },
        { name: page });
});