const path = require('path');
const fs = require('fs');
const analyzeResume = require('../utils/aiAnalyzer');
const { parsePdf } = require('../utils/pdfParser');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const User = require('../models/Users');

/**
 * Analyze uploaded resume and optionally save to database for logged-in users
 */
async function analyzeUploadedResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    
    // Get optional job description from request body
    const { jobTitle, jobDescription, companyName } = req.body;

    // Check if user is authenticated and has credits
    let userCredits = null;
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (!user) {
        // Clean up file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      
      // Check credits (pro and enterprise have unlimited)
      if (user.plan === 'free' && user.credits <= 0) {
        // Clean up file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(403).json({ 
          success: false, 
          message: 'No credits remaining. Please upgrade to continue.',
          credits: 0,
          needsUpgrade: true
        });
      }
      userCredits = user.credits;
    }

    // Parse PDF to text
    const resumeText = await parsePdf(filePath);
    
    // Analyze the resume
    const rawAnalysis = await analyzeResume(resumeText);
    console.log('Resume analyzed successfully');

    // Extract overall score from analysis
    const atsScore = rawAnalysis?.overallScore || 0;

    // If user is authenticated, save the analysis and file to database
    let savedAnalysis = null;
    let savedFilePath = null;
    let remainingCredits = userCredits;
    
    if (req.user && req.user.id) {
      try {
        // Create a user-specific directory for resumes
        const userDir = path.join(__dirname, '../uploads/resumes', req.user.id.toString());
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }
        
        // Move file to permanent location with unique name
        const timestamp = Date.now();
        const newFileName = `${timestamp}_${req.file.originalname}`;
        savedFilePath = path.join(userDir, newFileName);
        
        // Copy file to permanent location
        fs.copyFileSync(filePath, savedFilePath);
        
        // Store relative path for database
        const relativeFilePath = path.join('uploads/resumes', req.user.id.toString(), newFileName);
        
        savedAnalysis = await ResumeAnalysis.create({
          userId: req.user.id,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          filePath: relativeFilePath,
          jobTitle: jobTitle || '',
          jobDescription: jobDescription || '',
          companyName: companyName || '',
          atsScore: atsScore,
          analysisData: rawAnalysis,
          status: 'completed',
          analyzedAt: new Date(),
        });
        console.log('Analysis saved to database for user:', req.user.id);
        
        // Deduct credit for free plan users
        const user = await User.findById(req.user.id);
        if (user && user.plan === 'free') {
          user.credits = Math.max(0, user.credits - 1);
          user.totalAnalyses = (user.totalAnalyses || 0) + 1;
          user.lastAnalysisDate = new Date();
          await user.save();
          remainingCredits = user.credits;
          console.log('Credit deducted. Remaining:', remainingCredits);
        } else if (user) {
          user.totalAnalyses = (user.totalAnalyses || 0) + 1;
          user.lastAnalysisDate = new Date();
          await user.save();
          remainingCredits = -1; // Unlimited for pro/enterprise
        }
      } catch (dbError) {
        console.error('Failed to save analysis to database:', dbError.message);
        // Continue without saving - don't fail the request
      }
    }

    // Clean up the temporary uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      analysis: rawAnalysis,
      analysisId: savedAnalysis?._id || null,
      saved: !!savedAnalysis,
      credits: remainingCredits,
    });

  } catch (error) {
    console.error('Error analyzing resume:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}

/**
 * Get user's resume analysis history
 */
async function getUserAnalyses(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [analyses, total] = await Promise.all([
      ResumeAnalysis.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('fileName jobTitle companyName atsScore status uploadDate createdAt'),
      ResumeAnalysis.countDocuments({ userId: req.user.id }),
    ]);

    res.json({
      success: true,
      analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching analyses:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch analyses' });
  }
}

/**
 * Get a specific analysis by ID
 */
async function getAnalysisById(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { id } = req.params;
    
    const analysis = await ResumeAnalysis.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Error fetching analysis:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch analysis' });
  }
}

/**
 * Delete an analysis
 */
async function deleteAnalysis(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { id } = req.params;
    
    const analysis = await ResumeAnalysis.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting analysis:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete analysis' });
  }
}

/**
 * Get dashboard stats for user
 */
async function getDashboardStats(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userId = req.user.id;

    const [totalAnalyses, recentAnalyses, avgScore] = await Promise.all([
      ResumeAnalysis.countDocuments({ userId }),
      ResumeAnalysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fileName jobTitle companyName atsScore status createdAt'),
      ResumeAnalysis.aggregate([
        { $match: { userId: new (require('mongoose').Types.ObjectId)(userId) } },
        { $group: { _id: null, avgScore: { $avg: '$atsScore' } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalAnalyses,
        averageScore: avgScore[0]?.avgScore || 0,
        recentAnalyses,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
}

/**
 * Get stored resume file
 */
async function getResumeFile(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { id } = req.params;
    
    const analysis = await ResumeAnalysis.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    if (!analysis.filePath) {
      return res.status(404).json({ success: false, message: 'Resume file not available' });
    }

    const fullPath = path.join(__dirname, '..', analysis.filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', analysis.fileType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${analysis.fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error getting resume file:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get resume file' });
  }
}

module.exports = {
  analyzeUploadedResume,
  getUserAnalyses,
  getAnalysisById,
  deleteAnalysis,
  getDashboardStats,
  getResumeFile,
};
