const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const User = require("./db/UserModel");
const Quote = require("./db/QuoteModel");
const stringSimilarity = require("string-similarity"); // Import the string-similarity library

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// require database connection
const dbConnect = require("./db/dbConnect");

// execute database connection
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, PATCH, OPTIONS"
	);
	next();
});

app.post("/register", (request, response) => {
	const { email, password } = request.body;

	// Check if the email already exists in the database
	User.findOne({ email })
		.then((existingUser) => {
			if (existingUser) {
				// Email already exists, return an error response
				return response.status(400).send({
					message: "Email is already in use",
				});
			}

			// Hash the password and create the new user
			bcrypt
				.hash(password, 10)
				.then((hashedPassword) => {
					const newUser = new User({
						email: email,
						password: hashedPassword,
					});

					newUser
						.save()
						.then((result) => {
							response.status(201).send({
								message: "User Created Successfully",
								result,
							});
						})
						.catch((error) => {
							response.status(500).send({
								message: "Error creating user",
								error,
							});
						});
				})
				.catch((error) => {
					response.status(500).send({
						message: "Password was not hashed successfully",
						error,
					});
				});
		})
		.catch((error) => {
			response.status(500).send({
				message: "Error checking email uniqueness",
				error,
			});
		});
});

app.get("/users", auth, (request, response) => {
	User.find()
		.then((users) => {
			response.status(200).send(users);
		})
		.catch((error) => {
			response.status(500).send({
				message: "Error retrieving users",
				error,
			});
		});
});

app.post("/login", (request, response) => {
	User.findOne({ email: request.body.email })

		.then((user) => {
			bcrypt
				.compare(request.body.password, user.password)
				.then((passwordCheck) => {
					if (!passwordCheck) {
						return response.status(400).send({
							message: "Passwords does not match",
							error,
						});
					}

					//   create JWT token
					const token = jwt.sign(
						{
							userId: user._id,
							userEmail: user.email,
						},
						"RANDOM-TOKEN",
						{ expiresIn: "24h" }
					);

					//   return success response
					response.status(200).send({
						message: "Login Successful",
						email: user.email,
						token,
						userId: user._id,
					});
				})
				// catch error if password does not match
				.catch((error) => {
					response.status(400).send({
						message: "Passwords does not match",
						error,
					});
				});
		})
		// catch error if email does not exist
		.catch((e) => {
			response.status(404).send({
				message: "Email not found",
				e,
			});
		});
});

app.get("/users", (request, response) => {
	User.find()
		.then((users) => {
			response.status(200).send(users);
		})
		.catch((error) => {
			response.status(500).send({
				message: "Error retrieving users",
				error,
			});
		});
});

app.post("/quotes", (request, response) => {
	const { content, author, tags, userId } = request.body;

	// Fetch all existing quotes from the database
	Quote.find()
		.then((existingQuotes) => {
			// Check if the new quote content is too similar to any existing quote
			const similarityThreshold = 0.8; // Set a similarity threshold
			const isSimilar = existingQuotes.some((quote) => {
				const similarity = stringSimilarity.compareTwoStrings(
					content,
					quote.content
				);
				return similarity >= similarityThreshold;
			});

			if (isSimilar) {
				// New quote is too similar to existing quotes, return an error response
				return response.status(400).send({
					message: "Quote is too similar to existing quotes",
				});
			}

			// Create a new quote and save it to the database
			const newQuote = new Quote({
				content,
				author,
				tags,
				userId,
			});

			newQuote
				.save()
				.then((result) => {
					response.status(201).send({
						message: "Quote Created Successfully",
						result,
					});
				})
				.catch((error) => {
					response.status(500).send({
						message: "Error creating quote",
						error,
					});
				});
		})
		.catch((error) => {
			response.status(500).send({
				message: "Error retrieving existing quotes",
				error,
			});
		});
});

// Get all quotes
app.get("/quotes", (request, response) => {
	const page = parseInt(request.query.page) || 1;
	const perPage = 10;

	const authorName = request.query.author;
	const tags = request.query.tags;
	const sortField = request.query.sort; // Get the field to sort by from the query parameters
	const sortDirection = request.query.sortDirection === "desc" ? -1 : 1; // Determine the sort direction based on the query parameter

	const query = {};

	if (authorName) {
		query.author = authorName;
	}

	if (tags) {
		query.tags = { $in: tags.split(",") };
	}

	Quote.find(query)
		.skip((page - 1) * perPage)
		.limit(perPage)
		.then((quotes) => {
			// Sort quotes based on the sortField and sortDirection
			quotes.sort((a, b) => {
				if (sortField === "upvotesCount") {
					return sortDirection * (a.upvotesCount - b.upvotesCount);
				} else if (sortField === "downvotesCount") {
					return sortDirection * (a.downvotesCount - b.downvotesCount);
				} else if (sortField === "createdAt") {
					return sortDirection * (a.createdAt - b.createdAt);
				} else {
					return sortDirection * (a.createdAt - b.createdAt);
				}
			});

			response.status(200).send(quotes);
		})
		.catch((error) => {
			response.status(500).send({
				message: "Error retrieving quotes",
				error,
			});
		});
});

app.put("/quotes/:quoteId/vote", (request, response) => {
	const { quoteId } = request.params;
	const { voteType } = request.body;
	const token = request.headers.authorization.split(" ")[1]; // Get the token from the Authorization header

	// Decode the token to get the user ID
	const decodedToken = jwt.verify(token, "RANDOM-TOKEN"); // Replace 'RANDOM-TOKEN' with your actual secret key
	const userId = decodedToken.userId;

	// Check if the vote type is valid
	if (voteType !== "upvote" && voteType !== "downvote" && voteType !== "none") {
		response.status(400).send({ message: "Invalid vote type!" });
		return;
	}

	Quote.findById(quoteId)
		.then((quote) => {
			if (!quote) {
				return response.status(404).send({
					message: "Quote not found.",
				});
			}

			const hasUpvoted = quote.upvotedBy.includes(userId);
			const hasDownvoted = quote.downvotedBy.includes(userId);

			// Remove the user's vote if the payload is "none"
			if (voteType === "none") {
				if (hasUpvoted) {
					quote.upvotedBy.pull(userId);
					quote.upvotesCount -= 1;
				} else if (hasDownvoted) {
					quote.downvotedBy.pull(userId);
					quote.downvotesCount -= 1;
				}
			} else if (hasUpvoted || hasDownvoted) {
				return response.status(400).send({
					message: "You have already voted for this quote.",
				});
			} else {
				const updateField =
					voteType === "upvote" ? "upvotesCount" : "downvotesCount";

				// Update the quote's vote count
				quote[updateField] += 1;

				// Mark the user as having voted
				if (voteType === "upvote") {
					quote.upvotedBy.push(userId);
				} else if (voteType === "downvote") {
					quote.downvotedBy.push(userId);
				}
			}

			quote.save().then((updatedQuote) => {
				response.status(200).send(updatedQuote);
			});
		})
		.catch((error) => {
			response.status(500).send({
				message: "Error updating vote",
				error,
			});
		});
});

// brisanje citata

app.delete("/quotes/:id", (req, res) => {
	const quoteId = req.params.id;

	// Pronalaženje citata po ID-u i brisanje
	Quote.findByIdAndDelete(quoteId)
		.then(() => {
			res.status(204).send(); // Vraćanje statusa "No Content" (uspešno brisanje)
		})
		.catch((error) => {
			res.status(500).send({
				message: "Error deleting quote",
				error,
			});
		});
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
	response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
	response.json({ message: "You are authorized to access me" });
});

app.listen(3000, () => {
	console.log("port is listening on 3000");
});
