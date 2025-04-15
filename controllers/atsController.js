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

        
        const resumeText = await parsePdf(filePath);

      
        const rawAnalysis = await analyzeResume(resumeText);

       
        fs.unlinkSync(filePath);
        const cleaned = rawAnalysis.replace(/```json|```/g, '').trim();

        const analysis = JSON.parse(cleaned);
        console.log(analysis)
        res.json({
            success: true,
            message: 'Resume analyzed successfully',
            analysis : analysis
            
        });

    } catch (error) {
        console.error('Error analyzing resume:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
}

module.exports = {
    analyzeUploadedResume
};
