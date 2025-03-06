const Resume = require("../models/Resume");

exports.uploadResume = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a resume file'
            });
        }

        // Create new resume document with only name and email
        const resume = await Resume.create({
            candidateName: req.body.candidateName,
            candidateEmail: req.body.candidateEmail,
            fileName: req.file.filename,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        }); 

        res.status(201).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: resume
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading resume',
            error: error.message
        });
    }
};

