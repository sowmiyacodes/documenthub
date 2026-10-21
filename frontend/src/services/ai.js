
import api from "./api";

/*
=========================================
Document AI
=========================================
*/

export const askAI = async ({ question, documentId }) => {
  const response = await api.post("/ai/chat", {
    question,
    documentId,
  });

  return response.data;
};

export const getSummary = async (documentId) => {
  const response = await api.get(`/ai/document/${documentId}/summary`);

  return response.data;
};

/*
=========================================
Persistent Chat History
=========================================
*/

export const createConversation = async () => {
  const response = await api.post("/ai/conversations", {});
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get("/ai/conversations");
  return response.data;
};

export const getConversationMessages = async (conversationId) => {
  const response = await api.get(
    `/ai/conversations/${conversationId}/messages`
  );

  return response.data;
};

export const sendChatMessage = async (conversationId, question) => {
  const response = await api.post(
    `/ai/conversations/${conversationId}/messages`,
    { question }
  );

  return response.data;
};

export const renameConversation = async (conversationId, title) => {
  const response = await api.patch(
    `/ai/conversations/${conversationId}`,
    { title }
  );

  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await api.delete(
    `/ai/conversations/${conversationId}`
  );

  return response.data;
};
