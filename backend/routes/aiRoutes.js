
const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const {
    askQuestion,
    semanticSearch,
    getSummary,
    getStatus,
} = require("../controllers/aiController");

const {
    createConversation,
    listConversations,
    getMessages,
    sendMessage,
    renameConversation,
    deleteConversation,
} = require("../controllers/conversationController");

// Existing AI endpoints
router.post("/chat", authenticateUser, askQuestion);
router.post("/search", authenticateUser, semanticSearch);

router.get(
    "/document/:id/summary",
    authenticateUser,
    getSummary
);

router.get(
    "/document/:id/status",
    authenticateUser,
    getStatus
);

// Persistent chat history
router.post(
    "/conversations",
    authenticateUser,
    createConversation
);

router.get(
    "/conversations",
    authenticateUser,
    listConversations
);

router.get(
    "/conversations/:id/messages",
    authenticateUser,
    getMessages
);

router.post(
    "/conversations/:id/messages",
    authenticateUser,
    sendMessage
);

router.patch(
    "/conversations/:id",
    authenticateUser,
    renameConversation
);

router.delete(
    "/conversations/:id",
    authenticateUser,
    deleteConversation
);

module.exports = router;
