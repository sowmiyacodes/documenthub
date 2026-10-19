
const supabase = require("../config/supabase");
const ragService = require("../ai/services/rag.service");

const getOwnedConversation = async (conversationId, userId) => {
    const { data, error } = await supabase
        .from("ai_conversations")
        .select("id, user_id, title, created_at, updated_at")
        .eq("id", conversationId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw new Error(error.message);

    return data;
};

// POST /api/ai/conversations
const createConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const title = "New chat";

        const { data, error } = await supabase
            .from("ai_conversations")
            .insert({ user_id: userId, title })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return res.status(201).json({
            success: true,
            conversation: data,
        });
    } catch (error) {
        console.error("Create conversation error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to create conversation.",
        });
    }
};

// GET /api/ai/conversations
const listConversations = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("ai_conversations")
            .select("id, title, created_at, updated_at")
            .eq("user_id", req.user.id)
            .order("updated_at", { ascending: false });

        if (error) throw new Error(error.message);

        return res.status(200).json({
            success: true,
            conversations: data || [],
        });
    } catch (error) {
        console.error("List conversations error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to load chat history.",
        });
    }
};

// GET /api/ai/conversations/:id/messages
const getMessages = async (req, res) => {
    try {
        const conversation = await getOwnedConversation(
            req.params.id,
            req.user.id
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found.",
            });
        }

        const { data, error } = await supabase
            .from("ai_messages")
            .select("id, conversation_id, role, content, sources, created_at")
            .eq("conversation_id", conversation.id)
            .eq("user_id", req.user.id)
            .order("created_at", { ascending: true });

        if (error) throw new Error(error.message);

        return res.status(200).json({
            success: true,
            conversation,
            messages: data || [],
        });
    } catch (error) {
        console.error("Load messages error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to load conversation.",
        });
    }
};

// POST /api/ai/conversations/:id/messages
const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;
        const question =
            typeof req.body.question === "string"
                ? req.body.question.trim()
                : "";

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required.",
            });
        }

        if (question.length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Question must be 10,000 characters or fewer.",
            });
        }

        const conversation = await getOwnedConversation(
            conversationId,
            userId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found.",
            });
        }

        // Save the user's message.
        const { data: userMessage, error: userMessageError } =
            await supabase
                .from("ai_messages")
                .insert({
                    conversation_id: conversationId,
                    user_id: userId,
                    role: "user",
                    content: question,
                })
                .select()
                .single();

        if (userMessageError) {
            throw new Error(userMessageError.message);
        }

        // Generate an initial title from the first question.
        let title = conversation.title;

        if (title === "New chat") {
            title =
                question.length > 60
                    ? `${question.slice(0, 57)}...`
                    : question;
        }

        const { error: titleError } = await supabase
            .from("ai_conversations")
            .update({
                title,
                updated_at: new Date().toISOString(),
            })
            .eq("id", conversationId)
            .eq("user_id", userId);

        if (titleError) {
            throw new Error(titleError.message);
        }

        // Reuse the existing RAG pipeline.
        // No documentId means search across this user's documents.
        const result = await ragService.askQuestion({
            userId,
            question,
        });

        const answer = result.answer || "I couldn't generate an answer.";
        const sources = result.sources || [];

        const { data: assistantMessage, error: assistantError } =
            await supabase
                .from("ai_messages")
                .insert({
                    conversation_id: conversationId,
                    user_id: userId,
                    role: "assistant",
                    content: answer,
                    sources,
                })
                .select()
                .single();

        if (assistantError) {
            throw new Error(assistantError.message);
        }

        return res.status(200).json({
            success: true,
            conversation: {
                id: conversationId,
                title,
            },
            userMessage,
            assistantMessage,
        });
    } catch (error) {
        console.error("Send chat message error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to answer your question. Please try again.",
        });
    }
};

// PATCH /api/ai/conversations/:id
const renameConversation = async (req, res) => {
    try {
        const title =
            typeof req.body.title === "string"
                ? req.body.title.trim()
                : "";

        if (!title || title.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Title must be between 1 and 100 characters.",
            });
        }

        const { data, error } = await supabase
            .from("ai_conversations")
            .update({
                title,
                updated_at: new Date().toISOString(),
            })
            .eq("id", req.params.id)
            .eq("user_id", req.user.id)
            .select("id, title, created_at, updated_at")
            .maybeSingle();

        if (error) throw new Error(error.message);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found.",
            });
        }

        return res.status(200).json({
            success: true,
            conversation: data,
        });
    } catch (error) {
        console.error("Rename conversation error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to rename conversation.",
        });
    }
};

// DELETE /api/ai/conversations/:id
const deleteConversation = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("ai_conversations")
            .delete()
            .eq("id", req.params.id)
            .eq("user_id", req.user.id)
            .select("id")
            .maybeSingle();

        if (error) throw new Error(error.message);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found.",
            });
        }

        // ai_messages are deleted automatically by ON DELETE CASCADE.
        return res.status(200).json({
            success: true,
            message: "Conversation deleted.",
        });
    } catch (error) {
        console.error("Delete conversation error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to delete conversation.",
        });
    }
};

module.exports = {
    createConversation,
    listConversations,
    getMessages,
    sendMessage,
    renameConversation,
    deleteConversation,
};
