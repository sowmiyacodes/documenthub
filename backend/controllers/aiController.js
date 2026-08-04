const ragService = require("../ai/services/rag.service");

const askQuestion = async (req, res) => {
    try {

        const { question } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Question is required."
            });
        }

        const result = await ragService.askQuestion({
            userId: req.user.id,
            question
        });

        return res.status(200).json({
            success: true,
            answer: result.answer,
            sources: result.sources
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    askQuestion
};