const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
	try {
		// Check if the request is for the /users endpoint
		if (request.path === "/users" && request.method === "GET") {
			// Skip token verification for the /users GET endpoint
			next();
		} else {
			// For other endpoints, proceed with token verification
			const token = request.headers.authorization.split(" ")[1];
			const decodedToken = jwt.verify(token, "RANDOM-TOKEN");
			request.user = decodedToken;
			next();
		}
	} catch (error) {
		response.status(401).json({
			error: new Error("Invalid request!"),
		});
	}
};
