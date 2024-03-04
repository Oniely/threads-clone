import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
	mongoose.set("strictQuery", true);

	if (!process.env.MONGO_URI) return console.log("MONGO_URI not found.");
	if (isConnected) return console.log("Already connected to DB");

	try {
		mongoose.connect(process.env.MONGO_URI);

		isConnected = true;
		console.log("Connected to DB");
	} catch (error) {
		console.log(error);
	}
};
