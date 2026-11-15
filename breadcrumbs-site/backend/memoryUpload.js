
const multer = require("multer");

// Maximum size of each incoming image
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

// Store uploaded files in memory for processing with Sharp
const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: MAX_PHOTO_SIZE,
        files: 6
    },

    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error("Only JPEG, PNG, and WebP images are allowed")
            );
        }

        callback(null, true);
    }
});

module.exports = upload;
