'use strict'
// Import mongoose module
var mongoose = require('mongoose');

// Schema for our subtopics
var SubtopicSchema = new mongoose.Schema({
	// Each Subtopic has a title (English & Korean), image, and body of text (English & Korean)
	title: String,
	alt_title: String,
	image: String,
	body: String,
	alt_body: String,
	// Reference to the topic which contains this subtopic
	topic: {type: mongoose.Schema.Types.ObjectId, ref: 'Topic'}
});

// Create our model
mongoose.model('Subtopic', SubtopicSchema);