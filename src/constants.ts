export const DB_NAME = "chatee";

export const USER_ROLE_ENUM = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const USER_REGISTER_TYPE = {
  LOCAL: "PHONE_NUMBER",
};

// export const ChatEventEnum = Object.freeze({
//   CONNECTED_EVENT: "connected",
//   DISCONNECT_EVENT: "disconnect",
//   NEW_CHAT_EVENT: "newChat",
//   JOIN_CHAT_EVENT: "joinChat",
//   LEAVE_CHAT_EVENT: "leaveChat",
//   MESSAAGE_SEND_EVENT: "sendMessage",
//   MESSAGE_RECEIVED_EVENT: "messageReceived",
//   TYPING_EVENT: "typing",
//   STOP_TYPING_EVENT: "stopTyping",
//   MESSAGE_DELETE_EVENT: "messageDeleted",
//   GET_RECEIVER_STATUS: "getReceiverStatus",
//   IS_RECEIVER_ONLINE_EVENT: "isReceiverOnline",
//   SOCKET_ERROR_EVENT: "socketError",
// });

export enum ChatEventEnum {
  JOIN_CHAT_EVENT = "JOIN_CHAT",
  LEAVE_CHAT_EVENT = "LEAVE_CHAT",
  TYPING_EVENT = "TYPING",
  STOP_TYPING_EVENT = "STOP_TYPING",
  GET_RECEIVER_STATUS = "GET_RECEIVER_STATUS",
  IS_RECEIVER_ONLINE_EVENT = "IS_RECEIVER_ONLINE",
  CONNECTED_EVENT = "CONNECTED",
  MESSAAGE_SEND_EVENT = "MESSAGE_SEND",
  DISCONNECT_EVENT = "DISCONNECT",
  SOCKET_ERROR_EVENT = "SOCKET_ERROR",
  CALL_OFFER = "CALL_OFFER",
  CALL_ANSWER = "CALL_ANSWER",
  ICE_CANDIDATE = "ICE_CANDIDATE",
}
