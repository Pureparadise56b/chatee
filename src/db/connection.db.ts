import mongoose from "mongoose";
import { DB_NAME } from "../constants";

export const connecDb = async () => {
  try {
    const conn = await mongoose.connect(
      `${process.env.DATABASE_URL}/${DB_NAME}`
    );
    console.log(`\nMongoDb Connected! 🌿 Host: ${conn.connection.host}`);
  } catch (error) {
    console.error("\nDatabase Connection Error :: ", error);
    process.exit(1);
  }
};
