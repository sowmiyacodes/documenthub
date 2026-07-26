const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
    },
    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, PNG and JPG files are allowed."));
        }
    }
});

module.exports = upload;