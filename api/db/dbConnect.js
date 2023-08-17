const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

const connectToDB = async () => {
	mongoose.set("strictQuery", true);

	if (isConnected) {
		console.log("MongoDB is already connected");
		return;
	}
	try {
		await mongoose.connect(process.env.DB_URL, {
			dbName: "share_prompt",
		});
		isConnected = true;
	} catch (error) {
		console.log(error);
	}
	console.log(isConnected);
};
module.exports = connectToDB;
