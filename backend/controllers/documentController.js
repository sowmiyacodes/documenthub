const supabase = require("../config/supabase");
const path = require("path");

const uploadDocument = async (req, res) => {
    try {

        const { category, description } = req.body;

        const user_id = req.user.id;
        

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded."
            });
        }

        const file = req.file;

        // Create unique filename
        const extension = path.extname(file.originalname);
        const fileName = `${Date.now()}${extension}`;

        // Storage path
        const storagePath = `${user_id}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(storagePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            return res.status(500).json({
                success: false,
                message: uploadError.message,
                
            });
        }

        // Save metadata
        const { data, error: dbError } = await supabase
            .from("documents")
            .insert([
                {
                    user_id,
                    original_name: file.originalname,
                    stored_name: fileName,
                    storage_path: storagePath,
                    file_type: file.mimetype,
                    file_size: file.size,
                    category: category || "Others",
                    description: description || null,
                },
            ])
            .select();

        if (dbError) {

            // Remove uploaded file if DB insert fails
            await supabase.storage
                .from("documents")
                .remove([storagePath]);

            return res.status(500).json({
                success: false,
                message: dbError.message,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully.",
            document: data[0],
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

const getDocuments = async (req, res) => {
    try {

        const user_id = req.user.id;

        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("user_id", user_id)
            .order("uploaded_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            count: data.length,
            documents: data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const viewDocument = async (req, res) => {
    try {

        const user_id = req.user.id;
        const { id } = req.params;

        // Find the document and verify ownership
        const { data: document, error } = await supabase
            .from("documents")
            .select("*")
            .eq("id", id)
            .eq("user_id", user_id)
            .single();

        if (error || !document) {
            return res.status(404).json({
                success: false,
                message: "Document not found."
            });
        }

        // Generate signed URL (valid for 1 hour)
        const { data, error: signedUrlError } = await supabase.storage
            .from("documents")
            .createSignedUrl(document.storage_path, 60 * 60);

        if (signedUrlError) {
            return res.status(500).json({
                success: false,
                message: signedUrlError.message
            });
        }

        return res.status(200).json({
            success: true,
            url: data.signedUrl,
            document
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const deleteDocument = async (req, res) => {
    try {

        const user_id = req.user.id;
        const { id } = req.params;

        // Find the document and verify ownership
        const { data: document, error } = await supabase
            .from("documents")
            .select("*")
            .eq("id", id)
            .eq("user_id", user_id)
            .single();

        if (error || !document) {
            return res.status(404).json({
                success: false,
                message: "Document not found."
            });
        }

        // Delete file from Storage
        const { error: storageError } = await supabase.storage
            .from("documents")
            .remove([document.storage_path]);

        if (storageError) {
            return res.status(500).json({
                success: false,
                message: storageError.message
            });
        }

        // Delete database record
        const { error: dbError } = await supabase
            .from("documents")
            .delete()
            .eq("id", id);

        if (dbError) {
            return res.status(500).json({
                success: false,
                message: dbError.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully."
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    uploadDocument,
     getDocuments,
    viewDocument,
    deleteDocument,

};