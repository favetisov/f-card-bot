export const ping = (message: any) => {
  const webHookResponse =  {
    "method": "sendMessage",
    "chat_id": message.chat.id, 
    "text" : "I'm alive and feeling good"
  };
  return webHookResponse;
};
