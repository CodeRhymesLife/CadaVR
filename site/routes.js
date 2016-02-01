Router.route('/', function () {
  this.render('index');
});

Views = [
	"aframeTest",
	"menuSelection",
	"moveObject",
	"operatingTable",
	"views",
];

Views.forEach( function (page) {
	Router.route('/' + page, function () {
		this.render(page);
	});
});