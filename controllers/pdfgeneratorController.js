const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

// Register Handlebars helpers
Handlebars.registerHelper('if', function(conditional, options) {
  if (conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  return date;
});

Handlebars.registerHelper('hasItems', function(array, options) {
  if (array && array.length > 0) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// Template mapping
const TEMPLATES = {
  'professional-classic': 'professional-classic.html',
  'modern-minimal': 'modern-minimal.html',
  'tech-focus': 'tech-focus.html',
  'ats-optimized': 'ats-optimized.html',
  'executive': 'executive.html',
  'creative-bold': 'creative-bold.html',
  'open-resume': 'open-resume.html'
};

/**
 * Load and compile a template
 */
const loadTemplate = (templateId) => {
  const templateFile = TEMPLATES[templateId] || 'professional-classic.html';
  const templatePath = path.join(__dirname, '../templates', templateFile);
  
  if (!fs.existsSync(templatePath)) {
    // Fallback to professional-classic if template doesn't exist
    const fallbackPath = path.join(__dirname, '../templates', 'professional-classic.html');
    if (!fs.existsSync(fallbackPath)) {
      throw new Error(`Template not found: ${templateId}`);
    }
    const templateContent = fs.readFileSync(fallbackPath, 'utf-8');
    return Handlebars.compile(templateContent);
  }
  
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  return Handlebars.compile(templateContent);
};

/**
 * Transform resume data to template format
 */
const transformResumeData = (resumeData) => {
  const { personalInfo, experiences, projects, education, skills, certifications } = resumeData;
  
  return {
    // Personal Info
    fullName: personalInfo?.fullName || '',
    email: personalInfo?.email || '',
    phone: personalInfo?.phone || '',
    location: personalInfo?.location || '',
    linkedin: personalInfo?.linkedin || '',
    github: personalInfo?.github || '',
    portfolio: personalInfo?.portfolio || '',
    summary: personalInfo?.summary || '',
    tagline: personalInfo?.tagline || '',
    
    // Sections
    experiences: experiences || [],
    projects: projects || [],
    education: education || [],
    skills: skills || [],
    certifications: certifications || []
  };
};

/**
 * Generate PDF from resume data
 * POST /generate-pdf
 */
async function generatePDF(req, res) {
  let browser = null;
  
  try {
    const { resumeData, templateId = 'professional-classic' } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message: 'resumeData is required'
      });
    }

    // Load and compile template
    const template = loadTemplate(templateId);
    
    // Transform data for template
    const templateData = transformResumeData(resumeData);
    
    // Generate HTML
    const html = template(templateData);

    // Launch Puppeteer and generate PDF
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport to match letter size
    await page.setViewport({
      width: 816, // 8.5 inches * 96 DPI
      height: 1056, // 11 inches * 96 DPI
      deviceScaleFactor: 2
    });
    
    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'domcontentloaded'] 
    });
    
    // Generate PDF with proper settings
    const pdfUint8Array = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      },
      displayHeaderFooter: false
    });

    await browser.close();
    browser = null;

    // Convert Uint8Array to Buffer for proper handling
    const pdfBuffer = Buffer.from(pdfUint8Array);

    // Set response headers for PDF download
    const fileName = `${templateData.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
    
    // Clear any existing headers and set proper PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Send the buffer directly using end() for binary data
    return res.end(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
}

/**
 * Generate PDF and return as base64 (for preview)
 * POST /generate-pdf/preview
 */
async function generatePDFPreview(req, res) {
  let browser = null;
  
  try {
    const { resumeData, templateId = 'professional-classic' } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message: 'resumeData is required'
      });
    }

    // Load and compile template
    const template = loadTemplate(templateId);
    
    // Transform data for template
    const templateData = transformResumeData(resumeData);
    
    // Generate HTML
    const html = template(templateData);

    // Launch Puppeteer and generate PDF
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });

    await browser.close();
    browser = null;

    // Return base64 encoded PDF for preview
    const base64PDF = pdfBuffer.toString('base64');
    
    res.json({
      success: true,
      pdf: base64PDF,
      mimeType: 'application/pdf'
    });

  } catch (error) {
    console.error('Error generating PDF preview:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF preview',
      error: error.message
    });
  }
}

/**
 * Generate HTML preview (for iframe display)
 * POST /generate-pdf/html-preview
 */
async function generateHTMLPreview(req, res) {
  try {
    const { resumeData, templateId = 'professional-classic' } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message: 'resumeData is required'
      });
    }

    // Load and compile template
    const template = loadTemplate(templateId);
    
    // Transform data for template
    const templateData = transformResumeData(resumeData);
    
    // Generate HTML
    const html = template(templateData);
    
    res.json({
      success: true,
      html
    });

  } catch (error) {
    console.error('Error generating HTML preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate HTML preview',
      error: error.message
    });
  }
}

/**
 * Get template preview image
 * GET /generate-pdf/template-preview/:templateId
 */
async function getTemplatePreview(req, res) {
  try {
    const { templateId } = req.params;
    
    // Sample resume data for preview
    const sampleData = {
      personalInfo: {
        fullName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        summary: 'Experienced software engineer with 5+ years of expertise in building scalable web applications. Passionate about clean code and user experience.'
      },
      experiences: [
        {
          position: 'Senior Software Engineer',
          company: 'Tech Company Inc.',
          location: 'San Francisco, CA',
          startDate: 'Jan 2022',
          endDate: 'Present',
          current: true,
          highlights: [
            'Led development of microservices architecture serving 1M+ users',
            'Improved application performance by 40% through optimization',
            'Mentored team of 5 junior developers'
          ]
        }
      ],
      projects: [
        {
          name: 'E-Commerce Platform',
          technologies: ['React', 'Node.js', 'PostgreSQL'],
          highlights: ['Built full-stack solution with 99.9% uptime']
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          institution: 'University of Technology',
          startDate: '2016',
          endDate: '2020'
        }
      ],
      skills: [
        { category: 'Frontend', items: ['React', 'TypeScript', 'CSS'] },
        { category: 'Backend', items: ['Node.js', 'Python', 'PostgreSQL'] }
      ]
    };

    // Load and compile template
    const template = loadTemplate(templateId);
    const templateData = transformResumeData(sampleData);
    const html = template(templateData);

    // Generate preview image using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 850, height: 1100 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });

    await browser.close();

    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);

  } catch (error) {
    console.error('Error generating template preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template preview',
      error: error.message
    });
  }
}

module.exports = {
  generatePDF,
  generatePDFPreview,
  generateHTMLPreview,
  getTemplatePreview
};
