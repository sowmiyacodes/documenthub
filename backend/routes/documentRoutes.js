const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authenticateUser = require("../middleware/authMiddleware");

const {
    uploadDocument,
    getDocuments,
    getDocumentById,
    viewDocument,
    deleteDocument,
    getProcessingStatus,
} = require("../controllers/documentController");

// Get all documents of logged-in user
router.get(
    "/",
    authenticateUser,
    getDocuments
);


router.get(
    "/:id/status",
    authenticateUser,
    getProcessingStatus
);

// Get a single document
router.get(
    "/:id",
    authenticateUser,
    getDocumentById
);

// View a document (Generate Signed URL)
router.get(
    "/:id/view",
    authenticateUser,
    viewDocument
);

// Upload a document
router.post(
    "/upload",
    authenticateUser,
    upload.single("document"),
    uploadDocument
);

router.delete(
    "/:id",
    authenticateUser,
    deleteDocument
);

module.exports = router;