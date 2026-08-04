const supabase = require("../../config/supabase");

const downloadDocument = async (storagePath) => {
    const { data, error } = await supabase.storage
        .from("documents")
        .download(storagePath);

    if (error) {
        throw new Error(error.message);
    }

    // Convert Blob -> Buffer
    const arrayBuffer = await data.arrayBuffer();

    return Buffer.from(arrayBuffer);
};

module.exports = {
    downloadDocument,
};