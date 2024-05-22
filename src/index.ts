import dotenv from "dotenv";
import { connecDb } from "./db/connection.db";
import { httpServer } from "./app";
import { redisGlobalClient } from "./redis/config.redis";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

connecDb()
  .then(async () => {
    process.env.ENVIRONMENT === "DEVELOPMENT" &&
      (await redisGlobalClient.flushdb());

    httpServer.listen(port, () => {
      console.log(`Server started: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connect err: ", err);
  });
