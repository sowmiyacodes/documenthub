const path = require("path");
const supabase = require("../config/supabase");
const documentProcessor = require("../ai/models/documentProcessor");

const uploadDocument = async ({ file, userId, category, description }) => {
    // Create unique filename
    const extension = path.extname(file.originalname);
    const fileName = `${Date.now()}${extension}`;

    // Storage path
    const storagePath = `${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (uploadError) {
        throw new Error(uploadError.message);
    }

    // Save metadata in database
    const { data, error: dbError } = await supabase
        .from("documents")
        .insert([
            {
                user_id: userId,
                original_name: file.originalname,
                stored_name: fileName,
                storage_path: storagePath,
                file_type: file.mimetype,
                file_size: file.size,
                category: category || "Others",
                description: description || null,

                // AI Fields
                processing_status: "pending",
            },
        ])
        .select()
        .single();

    if (dbError) {
        // Rollback uploaded file
        await supabase.storage
            .from("documents")
            .remove([storagePath]);

        throw new Error(dbError.message);
    }

    /*
     * Start AI Processing
     * DO NOT await
     * Runs in background
     */
    documentProcessor
        .processDocument(data.id)
        .catch((err) =>
            console.error("AI Processing Error:", err.message)
        );

    return data;
};

module.exports = {
    uploadDocument,
};