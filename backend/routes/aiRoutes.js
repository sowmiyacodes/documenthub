const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const {
    askQuestion,
    semanticSearch,
    getSummary,
    getStatus,
} = require("../controllers/aiController");

/*
====================================================
AI CHAT (RAG)
POST /api/ai/chat
====================================================
*/
router.post(
    "/chat",
    authenticateUser,
    askQuestion
);

/*
====================================================
SEMANTIC SEARCH
POST /api/ai/search
====================================================
*/
router.post(
    "/search",
    authenticateUser,
    semanticSearch
);

/*
====================================================
GET DOCUMENT SUMMARY
GET /api/ai/document/:id/summary
====================================================
*/
router.get(
    "/document/:id/summary",
    authenticateUser,
    getSummary
);

/*
====================================================
GET PROCESSING STATUS
GET /api/ai/document/:id/status
====================================================
*/
router.get(
    "/document/:id/status",
    authenticateUser,
    getStatus
);

module.exports = router;