// ? Not use anymore....

import { Kafka } from "kafkajs";

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER!],
  clientId: "chatee-app",
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({ groupId: "message-group" });

export async function connectKafka() {
  try {
    await kafkaProducer.connect();
    await kafkaConsumer.connect();
  } catch (error) {
    console.error("Error while connecting to Kafka: ", error);
    process.exit(1);
  }
}
