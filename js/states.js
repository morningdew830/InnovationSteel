// STATE ROUTING
app.config(function($stateProvider, $urlRouterProvider) {

// For any unmatched url, redirect to /state1
$urlRouterProvider.otherwise("/");

$stateProvider
  .state('/', {
    url: "/",
    scope: true,
    templateUrl: "views/home.html"
  })
  .state('estimates', {
    url: "/estimates",
    scope: true,
    templateUrl: "views/estimates.html"
  })
  .state('add', {
    url: "/add",
    scope: true,
    templateUrl: "views/edit.html"
  })
  .state('edit', {
  	abstract: true,
  	template: '<ui-view/>'
  })
  .state('edit.estimateID', {
    url: "/edit/:estimateID",
    scope: true,
    templateUrl: "views/edit.html"
  })
  .state('view', {
  	abstract: true,
  	template: '<ui-view/>'
  })
  .state('view.estimateID', {
    url: "/view/:estimateID",
    scope: true,
    templateUrl: "views/single-estimate.html"
  })
  .state('view-pdf', {
    abstract: true,
    template: '<ui-view/>'
  })
  .state('view-pdf.estimateID', {
    url: "/view-pdf/:estimateID",
    scope: true,
    templateUrl: "views/view-pdf.html"
  })
  .state('logs', {
    url: "/logs/",
    scope: true,
    templateUrl: "views/logs.html"
  })
  .state('daily-log', {
    abstract: true,
    template: '<ui-view/>'
  })
  .state('daily-log.estimateID', {
    url: "/daily-log/:estimateID",
    scope: true,
    templateUrl: "views/daily-log.html"
  })
  .state('progress', {
    abstract: true,
    template: '<ui-view/>'
  })
  .state('progress.estimateID', {
    url: "/progress/:estimateID",
    scope: true,
    templateUrl: "views/progress.html"
  })
  .state('employees', {
    url: "/employees/",
    scope: true,
    templateUrl: "views/employees.html"
  })
  .state('login', {
    url: "/login/",
    scope: true,
    templateUrl: "views/login.html"
  })
  .state('labor', {
    url: "/labor/",
    scope: true,
    templateUrl: "views/labor.html"
  })
  .state('settings', {
    url: "/settings/",
    scope: true,
    templateUrl: "views/settings.html"
  })
  ;

});