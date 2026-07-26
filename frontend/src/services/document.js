import api from "./api";

// Upload document
export const uploadDocument = async (formData) => {
  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Get all documents
export const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

// View document
export const viewDocument = async (id) => {
  const response = await api.get(`/documents/${id}/view`);
  return response.data;
};

// Delete document
export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};