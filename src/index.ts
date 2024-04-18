import dotenv from "dotenv";
import { connecDb } from "./db/connection.db";
import { httpServer } from "./app";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

connecDb()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`Server started: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connect err: ", err);
  });
