import mongoose from "mongoose";

const MONGO_URI = process.env.DB_URL; // Ensure you have this in your `.env` file

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable.");
}

/** 
 * Global `mongoose.connection` ensures that the connection is reused
 * to avoid multiple connections in serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("Connected to MongoDB");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
