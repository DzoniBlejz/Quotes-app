const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
	content: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	tags: [String],
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	upvotesCount: {
		type: Number,
		default: 0,
	},
	downvotesCount: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	upvotedBy: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // Reference to the User model
		},
	],
	downvotedBy: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // Reference to the User model
		},
	],
});

const Quote = mongoose.model("Quote", quoteSchema);

module.exports = Quote;
