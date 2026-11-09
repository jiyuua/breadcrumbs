
const sharp = require("sharp");
const { randomUUID } = require("crypto");
const { supabase, storageBucket } = require("./supabaseStorage");


async function processMemoryPhoto(file) {
    // Make sure a valid file buffer was provided
    if (!file || !Buffer.isBuffer(file.buffer)) {
        const error = new Error("Invalid photo");
        error.status = 400;
        throw error;
    }

    // Validate the actual image content
    let metadata;

    try {
        metadata = await sharp(file.buffer, {
            limitInputPixels: 25_000_000
        }).metadata();
    } catch (error) {
        const invalidImageError = new Error(
            "Invalid or corrupted image"
        );

        invalidImageError.status = 400;
        throw invalidImageError;
    }

    // Only allow JPEG, PNG, and WebP images
    if (!["jpeg", "png", "webp"].includes(metadata.format)) {
        const error = new Error("Unsupported image format");
        error.status = 400;
        throw error;
    }

    // Resize and convert to WebP
    let processedBuffer;

    try {
        processedBuffer = await sharp(file.buffer, {
            limitInputPixels: 25_000_000
        })
            .rotate()
            .resize({
                width: 1600,
                height: 1600,
                fit: "inside",
                withoutEnlargement: true
            })
            .webp({ quality: 75 })
            .toBuffer();
    } catch (error) {
        const processingError = new Error(
            "Unable to process image"
        );

        processingError.status = 400;
        throw processingError;
    }

    // Maximum compressed image size: 2 MB
    const MAX_PROCESSED_SIZE = 2 * 1024 * 1024;

    if (processedBuffer.length > MAX_PROCESSED_SIZE) {
        const error = new Error(
            "Processed photo exceeds the 2 MB limit"
        );

        error.status = 413;
        throw error;
    }

    return processedBuffer;
}


// Upload a processed photo to private Supabase Storage
async function uploadMemoryPhoto(userId, memoryId, buffer) {
    const storagePath =
        `${userId}/${memoryId}/${randomUUID()}.webp`;

    const { error } = await supabase.storage
        .from(storageBucket)
        .upload(storagePath, buffer, {
            contentType: "image/webp",
            upsert: false
        });

    if (error) {
        throw new Error(`Photo upload failed: ${error.message}`);
    }

    return storagePath;
}

// Remove a photo from Supabase Storage
async function deleteMemoryPhoto(storagePath) {
    const { error } = await supabase.storage
        .from(storageBucket)
        .remove([storagePath]);

    if (error) {
        throw new Error(`Photo deletion failed: ${error.message}`);
    }
}

module.exports = {
    processMemoryPhoto,
    uploadMemoryPhoto,
    deleteMemoryPhoto
};
