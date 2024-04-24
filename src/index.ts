import dotenv from "dotenv";
import { connecDb } from "./db/connection.db";
import { httpServer } from "./app";
import { connectKafka } from "./kafka/config.kafka";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

connecDb()
  .then(async () => {
    await connectKafka();
    httpServer.listen(port, () => {
      console.log(`Server started: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connect err: ", err);
  });
