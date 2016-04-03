'use strict'
// Name the application and specify dependencies
var app = angular.module('kamlimApp', ['ui.router']);

// Configure states
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

	// State that displays a list of all topics
	$stateProvider.state('topics', {
		url: '/topics',
		templateUrl: '/topics.html',
		controller: 'TopicCtrl',
		resolve: {
			// Load all topics from our database when this state is entered
			loadPromise: ['AdminFact', function(AdminFact) {
				return AdminFact.getAll();
			}]
		}
	})


	// State that displays a list of all subtopics (under a given topic)
	.state('subtopics', {
		// Use the {id} attribute to specify which topic to load 
		url: '/topics/{id}',
		templateUrl: '/subtopics.html',
		controller: 'SubtopicCtrl',
		resolve: {
			// Load the specified topic from our database when this state is entered
			topic: ['$stateParams', 'AdminFact', function($stateParams, AdminFact) {
				return AdminFact.getSubtopics($stateParams.id);
			}]
		}
	});

	// All other states will route to this state
	$urlRouterProvider.otherwise('topics');
}]);

// Factory handles data transfers between front and back end
app.factory('AdminFact', ['$http', function($http) {

	// Factory's fields
	var object = {
		topics: [],
		focusedTopic: {},
		focusedSubtopic: {}
	};

	// Function definition for retrieving all topics from the database
	object.getAll = function() {
		return $http.get('/topics').success(function(data) {
			// Deep copy of the data
			angular.copy(data, object.topics);
		});
	};

	// Function definition for adding a new topic to the database
	object.createTopic = function(topic) {
		return $http.post('/topics', topic).success(function(data) {
			// Add the new topic to the array
			object.topics.push(data);
		});
	};

	// Function definition for editing an existing topic's fields
	object.editTopic = function(id) {
		return $http.get('/topics/' + id).success(function(data) {
			// Deepy copy of the data
			angular.copy(data, object.focusedTopic);
		});
	};

	// Function definition for updating a topic in the database
	object.updateTopic = function(topicsList, newTitle) {
		return $http.put('/topics/' + object.focusedTopic._id, newTitle).success(function(data) {
			// Locate the object we changed in our array
			var index = object.topics.map(function(element) {
				return element._id;
			}).indexOf(data._id);
			// Change the title to match the updated title
			object.topics[index].title = data.title;

		});
	};

	// Function definition for removing a topic from the database
	object.removeTopic = function(topicsList, id) {
		return $http.delete('/topics/' + id).success(function(data) {
			// Look up the object we deleted from the database
			var index = object.topics.map(function(element) {
				return element._id;
			}).indexOf(id);
			// Remove the object from our array
			topicsList.splice(index, 1);
		});
	};
	
	
	// Function definition for retrieveing all subtopics from the database
	object.getSubtopics = function(id) {
		return $http.get('/topics/' + id).then(function(res) {
			return res.data;
		});
	};

	// Function definition for adding a new subtopic to the database
	object.addSubtopic = function(id, subtopic) {
		return $http.post('/topics/' + id +'/subtopics/', subtopic);
	};

	// Function definition for editing a subtopic
	object.editSubtopic = function(topicId, subtopicId) {
		return $http.get('/topics/' + topicId + '/subtopics/' + subtopicId).success(function(data) {
			// Deepy copy of the data
			angular.copy(data, object.focusedSubtopic);
		});
	};

	
	// Function definition for updating an existing subtopic
	object.updateSubtopic = function(topic, newData) {
		return $http.put('/topics/' + topic._id + '/subtopics/' + object.focusedSubtopic._id, newData).success(function(data) {
			// Locate the subtopic in the array
			var index = topic.subtopics.map(function(element) {
				return element._id
			}).indexOf(data._id);
			// Modify the subtopic to match our updated data
			topic.subtopics[index].title = data.title;
			topic.subtopics[index].image = data.image;
			topic.subtopics[index].body = data.body;
		});
	};


	// Function definition for removing a subtopic from the database
	object.removeSubtopic = function(topic, topicId, subtopicId) {
		return $http.delete('/topics/' + topicId + '/subtopics/' + subtopicId).success(function(data) {
			// Look up the object we removed from our database in our local data
			var index = topic.subtopics.map(function(element) {
				return element._id;
			}).indexOf(subtopicId);
			console.log(index);
			// Remove that object from our client-side data
			topic.subtopics.splice(index, 1);
		});
	};

	return object;
}])

// Controller handling data for the Topics page
app.controller('TopicCtrl', ['$scope', 'AdminFact', function($scope, AdminFact) {

	// Retrieve all topics
	$scope.topics = AdminFact.topics;

	// Function definition for adding a new topic
	$scope.addTopic = function() {
		// Form validation
		if ($scope.title === '') return

		// Add the new topic
		AdminFact.createTopic({
			title: $scope.title
		})

		// Reset the text fields
		$scope.title = '';
	};

	// Function deletes a topic from the database using its ID
	$scope.deleteTopic = function(topicId) {
		AdminFact.removeTopic($scope.topics, topicId);
	};

	// Function definition for editing a topic
	$scope.editTopic = function(topicId) {
		AdminFact.editTopic(topicId).success(function(data){
			// Fill the form fields with the data from the topic we want to edit
			$scope.title = AdminFact.focusedTopic.title;
		});
	};

	// Function definition for updating a topic
	$scope.updateTopic = function() {
		// Form validation
		if ($scope.title === '') return;
		AdminFact.updateTopic($scope.topics, topicId, {
			title: $scope.title
		});
		// Reset form fields
		$scope.title = '';
	};
}]);

// Controller handling data for the Subtopics page
app.controller('SubtopicCtrl', ['$scope', 'AdminFact', 'topic', function($scope, AdminFact, topic) {
	// Retrieve a specific topic
	$scope.topic = topic;

	// Function definition for adding a new subtopic
	$scope.addSubtopic = function() {
		// Form validation
		if ($scope.title === '') return;
		// Add a new subtopic
		AdminFact.addSubtopic(topic._id, {
			title: $scope.title,
			image: $scope.image,
			body: $scope.body
		}).success(function(subtopic) {
			// Push the new subtopic to our local data array
			$scope.topic.subtopics.push(subtopic);
		});

		// Reset form fields
		$scope.title = '';
		$scope.image = '';
		$scope.body = '';
	};

	// Function definition for removing a subtopic
	$scope.deleteSubtopic = function(topicId, subtopicId) {
		AdminFact.removeSubtopic($scope.topic, topicId, subtopicId);
	};

	// Function definition for editing a subtopic
	$scope.editSubtopic = function(topicId, subtopicId) {
		AdminFact.editSubtopic(topicId, subtopicId).success(function(data) {
			// Fill in the page's form fields with data from the subtopic we want to edit
			$scope.title = AdminFact.focusedSubtopic.title;
			$scope.image = AdminFact.focusedSubtopic.image;
			$scope.body = AdminFact.focusedSubtopic.body;
		});
	};

	// Function definition for updating a subtopic
	$scope.updateSubtopic = function() {
		// Form validation
		if ($scope.title === '') return;
		AdminFact.updateSubtopic($scope.topic, {
			title: $scope.title,
			image: $scope.image,
			body: $scope.body
		});
		// Reset form fields
		$scope.title = '';
		$scope.image = '';
		$scope.body = '';
	}
}]);