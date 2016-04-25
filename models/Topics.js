'use strict'
// Import mongoose module
var mongoose = require('mongoose');

// Mongoose schema for topics
var TopicSchema = new mongoose.Schema({
	title: String,
	alt_title: String,
	// Each topic contains an array of subtopics
	subtopics: [{type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic'}]
});

// Create our schema
mongoose.model('Topic', TopicSchema);