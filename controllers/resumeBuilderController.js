const {
  generateSectionSuggestions,
  generateFullResumeReview,
  rewriteContent,
  generateBulletPoints
} = require('../utils/aiSuggestions');
const { parseResumeToStructuredData } = require('../utils/resumeParser');
const { parsePdf } = require('../utils/pdfParser');

/**
 * Get AI suggestions for a specific resume section
 * POST /resume-builder/suggestions
 */
async function getSectionSuggestions(req, res) {
  try {
    const { sectionType, content, jobTitle } = req.body;

    if (!sectionType || !content) {
      return res.status(400).json({
        success: false,
        message: 'sectionType and content are required'
      });
    }

    const validSections = ['summary', 'experience', 'project', 'skills', 'education'];
    if (!validSections.includes(sectionType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sectionType. Must be one of: ${validSections.join(', ')}`
      });
    }

    const suggestions = await generateSectionSuggestions(sectionType, content, jobTitle);

    if (suggestions.error) {
      return res.status(500).json({
        success: false,
        message: suggestions.error,
        details: suggestions.details
      });
    }

    res.json({
      success: true,
      sectionType,
      suggestions
    });

  } catch (error) {
    console.error('Error getting section suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

/**
 * Get full resume review with AI
 * POST /resume-builder/review
 */
async function getFullResumeReview(req, res) {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message: 'resumeData is required'
      });
    }

    const review = await generateFullResumeReview(resumeData);

    if (review.error) {
      return res.status(500).json({
        success: false,
        message: review.error,
        details: review.details
      });
    }

    res.json({
      success: true,
      review
    });

  } catch (error) {
    console.error('Error getting resume review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

/**
 * Rewrite content with AI
 * POST /resume-builder/rewrite
 */
async function rewriteSectionContent(req, res) {
  try {
    const { sectionType, content, style } = req.body;

    if (!sectionType || !content) {
      return res.status(400).json({
        success: false,
        message: 'sectionType and content are required'
      });
    }

    const result = await rewriteContent(sectionType, content, style || 'professional');

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }

    res.json({
      success: true,
      sectionType,
      result
    });

  } catch (error) {
    console.error('Error rewriting content:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

/**
 * Generate bullet points from description
 * POST /resume-builder/generate-bullets
 */
async function generateBullets(req, res) {
  try {
    const { description, count } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'description is required'
      });
    }

    const result = await generateBulletPoints(description, count || 4);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error generating bullets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

/**
 * Get available resume templates
 * GET /resume-builder/templates
 */
async function getTemplates(req, res) {
  try {
    // Template definitions - in production, these could come from a database
    const templates = [
      {
        id: 'professional-classic',
        name: 'Professional Classic',
        description: 'Clean, traditional layout perfect for corporate roles',
        preview: '/templates/previews/professional-classic.png',
        isPremium: false,
        atsScore: 95,
        category: 'professional'
      },
      {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        description: 'Contemporary design with focus on readability',
        preview: '/templates/previews/modern-minimal.png',
        isPremium: false,
        atsScore: 92,
        category: 'modern'
      },
      {
        id: 'tech-focus',
        name: 'Tech Focus',
        description: 'Optimized for technical roles with skills emphasis',
        preview: '/templates/previews/tech-focus.png',
        isPremium: false,
        atsScore: 94,
        category: 'technical'
      },
      {
        id: 'executive',
        name: 'Executive',
        description: 'Sophisticated design for senior positions',
        preview: '/templates/previews/executive.png',
        isPremium: true,
        atsScore: 90,
        category: 'executive'
      },
      {
        id: 'creative-bold',
        name: 'Creative Bold',
        description: 'Stand out with a unique, eye-catching design',
        preview: '/templates/previews/creative-bold.png',
        isPremium: true,
        atsScore: 85,
        category: 'creative'
      },
      {
        id: 'ats-optimized',
        name: 'ATS Optimized',
        description: 'Maximum ATS compatibility with clean formatting',
        preview: '/templates/previews/ats-optimized.png',
        isPremium: false,
        atsScore: 98,
        category: 'professional'
      }
    ];

    res.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

/**
 * Save resume data
 * POST /resume-builder/save
 */
async function saveResume(req, res) {
  try {
    const { resumeData, templateId } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message: 'resumeData is required'
      });
    }

    // In production, save to database
    // For now, return success with a mock ID
    const savedResume = {
      id: `resume_${Date.now()}`,
      userId,
      templateId: templateId || 'professional-classic',
      data: resumeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Resume saved successfully',
      resume: savedResume
    });

  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

/**
 * Parse uploaded resume into structured data for the builder
 * POST /resume-builder/parse
 */
async function parseResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    // Parse the PDF to extract text
    const resumeText = await parsePdf(req.file.path);
    console.log("resumeText",resumeText)
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from the uploaded file'
      });
    }

    // Use AI to parse the resume into structured data
    const structuredData = await parseResumeToStructuredData(resumeText);

    if (structuredData.error) {
      return res.status(500).json({
        success: false,
        message: structuredData.error,
        details: structuredData.details
      });
    }

    res.json({
      success: true,
      message: 'Resume parsed successfully',
      resumeData: structuredData
    });

  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

module.exports = {
  getSectionSuggestions,
  getFullResumeReview,
  rewriteSectionContent,
  generateBullets,
  getTemplates,
  saveResume,
  parseResume
};
