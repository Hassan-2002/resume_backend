const path = require('path');
const fs = require('fs');
const analyzeResume = require('../utils/aiAnalyzer');
const {parsePdf} = require('../utils/pdfParser'); 

async function analyzeUploadedResume(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const filePath = path.join(__dirname, '../uploads', req.file.filename);

        // 1. Parse PDF to text
        const resumeText = await parsePdf(filePath);

      
        const analysis = await analyzeResume(resumeText);
        console.log(analysis);
        // 4. Cleanup - Delete file after processing to save space
        fs.unlinkSync(filePath);

        
        // 5. Send response back to client
        res.json({
            success: true,
            message: 'Resume analyzed successfully',
            analysis
        });

    } catch (error) {
        console.error('Error analyzing resume:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
}

module.exports = {
    analyzeUploadedResume
};
