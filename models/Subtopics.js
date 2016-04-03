'use strict'
// Import mongoose module
var mongoose = require('mongoose')

// Schema for our subtopics
var SubtopicSchema = new mongoose.Schema({
	// Each Subtopic has a title, image and body of text 
	title: String,
	image: String,
	body: String,
	// Reference to the topic which contains this subtopic
	topic: {type: mongoose.Schema.Types.ObjectId, ref: 'Topic'}
})

// Create our model
mongoose.model('Subtopic', SubtopicSchema)