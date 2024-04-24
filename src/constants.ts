export const DB_NAME = "chatee";

export const USER_ROLE_ENUM = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const USER_REGISTER_TYPE = {
  LOCAL: "PHONE_NUMBER",
};

export const ChatEventEnum = Object.freeze({
  CONNECTED_EVENT: "connected",
  DISCONNECT_EVENT: "disconnect",
  JOIN_CHAT_EVENT: "joinChat",
  LEAVE_CHAT_EVENT: "leaveChat",
  MESSAAGE_SEND_EVENT: "sendMessage",
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  NEW_CHAT_EVENT: "newChat",
  SOCKET_ERROR_EVENT: "socketError",
  STOP_TYPING_EVENT: "stopTyping",
  TYPING_EVENT: "typing",
  MESSAGE_DELETE_EVENT: "messageDeleted",
});
