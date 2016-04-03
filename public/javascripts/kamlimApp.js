'use strict'
// Name the application and pass in dependencies
var app = angular.module('kamlimApp', ['ui.router', 'ngSanitize']);

// Configure states using UI router
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	// Home state for the application
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: '/home.html',
		controller:'HomeCtrl',
		resolve: {
			// Load all topics and subtopics whenever this state is entered
			topicPromise: ['TopicFact', function(TopicFact) {
				return TopicFact.getAll();
			}],
			subtopicPromise: ['TopicFact', function(TopicFact) {
				return TopicFact.getSubtopics();
			}]
		}
	})

	// State to display each page
	.state('subtopic', {
		url: '/subtopics/{id}',
		templateUrl: '/subtopic.html',
		controller: 'PageCtrl',
		resolve: {
			// Load all topics and subtopics whenever this state is entered
			topicPromise: ['TopicFact', function(TopicFact) {
				return TopicFact.getAll();
			}],
			subtopicPromise: ['TopicFact', function(TopicFact) {
				return TopicFact.getSubtopics();
			}]
		}
	});

	// Other states will route to the home state
	$urlRouterProvider.otherwise('home');
}]);

// Factory to retrieve data from the database and display it on the main website
app.factory('TopicFact', ['$http', function($http) {
	// Arrays to hold all of the topics and subtopics
	var object = {
		topics: [],
		subtopics: []
	};

	// Retrieve all topics from the database
	object.getAll = function() {
		return $http.get('/topics').success(function(data) {
			// Deep copy of the data
			angular.copy(data, object.topics);
		});
	};

	// Retrieve all subtopics from the database
	object.getSubtopics = function() {
		return $http.get('/subtopics').success(function(data) {
			angular.copy(data, object.subtopics)
		});
	};

	return object;
}]);

// Controller to handle the main page
app.controller('HomeCtrl', ['$scope', 'TopicFact', function($scope, TopicFact) {

	// Retrieve topics and subtopics
	$scope.topics = TopicFact.topics;
	$scope.subtopics = TopicFact.subtopics;

}]);

// Controller to handle each subtopic page
app.controller('PageCtrl', ['$scope', '$stateParams', 'TopicFact', function($scope, $stateParams, TopicFact) {
	// Retrieve data for a specific subtopic
	$scope.subtopic = TopicFact.subtopics[$stateParams.id];
}]);
