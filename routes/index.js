'use strict'
// Express modules
var express = require('express');
var router = express.Router();
// Mongoose imports
var mongoose = require('mongoose');
var Topic = mongoose.model('Topic');
var Subtopic = mongoose.model('Subtopic')


/********************* Preload data **************************/


// Pre-load a specific topic
router.param('topic', function(req, res, next, id) {
	// Generate a query to find the topic using its ID
	var query = Topic.findById(id);

	// Execute the database query
	query.exec(function(err, topic) {
		// Error handling
		if (err) return next(err);
		if (!topic) return next(new Error('Could not find topic using id'));
		// Bind the object to req.topic
		req.topic = topic;
		return next();
	})
})

// Pre-load a specific subtopic
router.param('subtopic', function(req, res, next, id){
	// Create a database query to find a subtopic by id
	var query = Subtopic.findById(id);
	// Execute the database query
	query.exec(function(err, subtopic) {
		// Error handling
		if (err) return next(err);
		if (!subtopic) return next(new Error('Could not find subtopic using id'));
		// Bind the object to req.subtopic
		req.subtopic = subtopic;
		return next();
	})
})

/********************* GET Requests **************************/

// GET request for the Kamlim home page
router.get('/', function(req, res, next) {
	// Render the page defined in index.ejs
	res.render('index', { title: 'Express' });
});

// GET request for the Kamlim admin page
router.get('/admin', function(req, res, next) {
	// Render the page defined in admin.ejs
	res.render('admin', {title: 'Express'});
});


// GET request that returns all topics
router.get('/topics', function(req, res, next) {
	// Query the database for all topics
	Topic.find(function(err, topics) {
		// Error handling
		if (err) return next(err);
		// Return JSON for all topics
		res.json(topics);
	});
});

// GET request that returns all subtopics
router.get('/subtopics', function(req, res, next) {
	// Query the database for all documents in the subtopic collection
	Subtopic.find(function(err, subtopics) {
		// Error handling
		if (err) return next(err);
		// Return all subtopics in JSON format
		res.json(subtopics);
	})
})

// GET request that returns a specific subtopic
router.get('/subtopics/:subtopic', function(req, res, next) {
	res.json(req.subtopic);
})


// GET request that returns a specific topic
router.get('/topics/:topic', function(req, res) {
	// Load all subtopics pertaining to the topic
	req.topic.populate('subtopics', function(err, topic) {
		if (err) return next(err);
		res.json(topic);
	})
})

// GET request that returns a specific subtopic
router.get('/topics/:topic/subtopics/:subtopic', function(req, res, next) {
	var subtopic = req.subtopic;
	res.json(subtopic);
	
})



/********************* POST Requests **************************/

// POST request for adding a new topic
router.post('/topics', function(req, res, next) {
	// Create a new Topic from the request
	var topic = new Topic(req.body);
	// Save the topic to our database
	topic.save(function(err, topic) {
		// Error handling
		if (err) return next(err);
		res.json(topic);
	});
});

// POST request for adding a new subtopic
router.post('/topics/:topic/subtopics', function(req, res, next) {
	// Create a new subtopic
	var subtopic = new Subtopic(req.body)
	// New subtopic contains a reference to its topic
	subtopic.topic = req.topic
	// Save the new subtopic to our database
	subtopic.save(function(err, subtopic) {{
		// Error handling
		if (err) return next(err);
		// Add the subtopic to our topic
		req.topic.subtopics.push(subtopic);
		// Save changes to our topic
		req.topic.save(function(err, topic) {
			// Error handling
			if (err) return next(err);
			res.json(subtopic);
		})
	}})
})


/********************* PUT Requests **************************/

// PUT request for updating a topic
router.put('/topics/:topic', function(req, res, next) {
	// Search the database for the topic and update its fields
	Topic.findOneAndUpdate({_id: req.params.topic}, {$set: {title: req.body.title}}, {new: true}, function(err, topic) {
		// Error handling
		if (err) return next(err);
		// Return the updated version of the topic
		res.json(topic);
	})
})

// PUT request for updating a subtopic
router.put('/topics/:topic/subtopics/:subtopic', function(req, res, next) {
	// Search the database for the subtopic and update its fields
	Subtopic.findOneAndUpdate({_id: req.params.subtopic}, {$set: {title: req.body.title, image: req.body.image, body: req.body.body}}, {new: true}, function(err, subtopic) {
		// Error handling
		if (err) return next(err);
		// Return the updated version of the subtopic
		res.json(subtopic);
	})
})

/********************* DELETE Requests **************************/


// DELETE request for removing a topic
router.delete('/topics/:topic', function(req, res, next) {
	// Look up the topic by ID and delete it
	Topic.find({_id: req.params.topic}).remove(function(err, topic) {
		// Error handling
		if (err) return next(err);
		res.json(topic);
	})
})

// DELETE request to remove a subtopic
router.delete('/topics/:topic/subtopics/:subtopic', function(req, res, next) {
	// Remove the subtopic from the topic's subtopic array
	Topic.findOneAndUpdate({_id: req.params.topic}, {$pull: {subtopics: req.params.subtopic}}, function(err, topic) {
			// Error handling
			if (err) return next(err);
	})
	// Look up the subtopic by ID and delete it
	Subtopic.find({_id: req.params.subtopic}).remove(function(err, subtopic) {
		// Error handling
		if (err) return next(err);
		res.json(subtopic);
	})
})

// Export the router
module.exports = router;
