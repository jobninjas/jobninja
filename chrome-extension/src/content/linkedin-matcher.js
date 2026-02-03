// LinkedIn Match Score Widget - Jobright-style overlay for LinkedIn job pages
// Detects LinkedIn job pages, extracts job data, calculates match score, and injects widget

const API_BASE_URL = 'https://nova-ninjas-production.up.railway.app';
let matchWidget = null;
let currentJobId = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLinkedInMatcher);
} else {
    initLinkedInMatcher();
}

function initLinkedInMatcher() {
    console.log('[jobNinjas] LinkedIn Matcher initialized');

    // Check if we're on a job detail page
    if (isLinkedInJobPage()) {
        waitForJobContent();
    }

    // Watch for URL changes (LinkedIn is SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (isLinkedInJobPage()) {
                waitForJobContent();
            } else {
                removeWidget();
            }
        }
    }).observe(document, { subtree: true, childList: true });
}

function isLinkedInJobPage() {
    return window.location.href.includes('linkedin.com/jobs/view/') ||
        window.location.href.includes('linkedin.com/jobs/collections/');
}

function waitForJobContent() {
    // Wait for job content to load
    const checkInterval = setInterval(() => {
        const jobTitle = extractJobTitle();
        const company = extractCompany();

        if (jobTitle && company) {
            clearInterval(checkInterval);
            processJobPage();
        }
    }, 500);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
}

function extractJobTitle() {
    // Try multiple selectors
    const selectors = [
        'h1.top-card-layout__title',
        'h1.t-24',
        '.job-details-jobs-unified-top-card__job-title h1',
        '.jobs-unified-top-card__job-title'
    ];

    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
            return el.textContent.trim();
        }
    }
    return null;
}

function extractCompany() {
    const selectors = [
        'a.topcard__org-name-link',
        '.job-details-jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name a',
        '.topcard__flavor-row .topcard__flavor--black'
    ];

    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
            return el.textContent.trim();
        }
    }
    return null;
}

function extractJobDescription() {
    const selectors = [
        '.jobs-description__content',
        '.jobs-box__html-content',
        '#job-details',
        '.description__text'
    ];

    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
            return el.textContent.trim();
        }
    }
    return '';
}

async function processJobPage() {
    const jobData = {
        title: extractJobTitle(),
        company: extractCompany(),
        description: extractJobDescription(),
        url: window.location.href
    };

    console.log('[jobNinjas] Processing job:', jobData.title, 'at', jobData.company);

    // Get auth token from storage
    chrome.storage.local.get(['auth_token', 'user_data'], async (result) => {
        if (!result.auth_token) {
            console.log('[jobNinjas] No auth token found, showing guest widget');
            injectWidget(null, jobData);
            return;
        }

        // Call backend API to get match score
        try {
            const matchData = await getMatchScore(jobData, result.auth_token);
            injectWidget(matchData, jobData);
        } catch (error) {
            console.error('[jobNinjas] Failed to get match score:', error);
            injectWidget(null, jobData);
        }
    });
}

async function getMatchScore(jobData, token) {
    const response = await fetch(`${API_BASE_URL}/api/jobs/match-score`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            job_title: jobData.title,
            company: jobData.company,
            description: jobData.description
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}

function injectWidget(matchData, jobData) {
    removeWidget(); // Remove existing widget

    const score = matchData?.match_score || 0;
    const keywordsMatched = matchData?.keywords_matched || 0;
    const keywordsTotal = matchData?.keywords_total || 8;
    const isAuthenticated = matchData !== null;

    // Determine match quality
    let matchQuality = 'poor';
    let matchColor = '#fee2e2'; // Light red
    let scoreColor = '#dc2626'; // Red

    if (score >= 70) {
        matchQuality = 'good';
        matchColor = '#ecfdf5'; // Light green
        scoreColor = '#059669'; // Green
    } else if (score >= 50) {
        matchQuality = 'medium';
        matchColor = '#fef3c7'; // Light yellow
        scoreColor = '#d97706'; // Orange
    }

    // Create widget container
    matchWidget = document.createElement('div');
    matchWidget.id = 'jobninjas-match-widget';
    matchWidget.innerHTML = `
        <style>
            #jobninjas-match-widget {
                position: fixed;
                top: 100px;
                right: 20px;
                width: 320px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                z-index: 999999;
                font-family: 'Outfit', -apple-system, sans-serif;
                border: 1px solid #e5e7eb;
                overflow: hidden;
                animation: slideInRight 0.4s cubic-bezier(0.19, 1, 0.22, 1);
            }
            
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .jn-widget-header {
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .jn-logo-section {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .jn-logo {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                background: linear-gradient(135deg, #00ced1 0%, #008b8b 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }
            
            .jn-brand {
                font-size: 0.95rem;
                font-weight: 700;
                color: #111;
            }
            
            .jn-close-btn {
                background: none;
                border: none;
                font-size: 18px;
                color: #999;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
            }
            
            .jn-close-btn:hover {
                color: #333;
            }
            
            .jn-match-content {
                padding: 20px;
                background: ${matchColor};
            }
            
            .jn-match-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 16px;
            }
            
            .jn-match-text {
                flex: 1;
            }
            
            .jn-match-label {
                font-size: 0.85rem;
                font-weight: 600;
                color: #666;
                margin-bottom: 4px;
            }
            
            .jn-match-subtitle {
                font-size: 0.75rem;
                color: #888;
                line-height: 1.4;
            }
            
            .jn-score-circle {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: white;
                border: 4px solid ${scoreColor};
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .jn-score-value {
                font-size: 1.5rem;
                font-weight: 800;
                color: ${scoreColor};
                line-height: 1;
            }
            
            .jn-score-label {
                font-size: 0.65rem;
                color: #666;
                font-weight: 600;
                margin-top: 2px;
            }
            
            .jn-keywords {
                font-size: 0.8rem;
                color: #333;
                margin-bottom: 16px;
                font-weight: 500;
            }
            
            .jn-cta-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #00ced1 0%, #008b8b 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: 700;
                font-size: 0.9rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 4px 12px rgba(0, 206, 209, 0.3);
            }
            
            .jn-cta-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 206, 209, 0.4);
            }
            
            .jn-cta-btn:active {
                transform: translateY(0);
            }
            
            .jn-auth-message {
                padding: 20px;
                text-align: center;
            }
            
            .jn-auth-message p {
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 16px;
                line-height: 1.5;
            }
            
            .jn-footer {
                padding: 12px 16px;
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
                font-size: 0.7rem;
                color: #999;
                text-align: center;
            }
        </style>
        
        <div class="jn-widget-header">
            <div class="jn-logo-section">
                <div class="jn-logo">🥷</div>
                <span class="jn-brand">jobNinjas</span>
            </div>
            <button class="jn-close-btn" onclick="document.getElementById('jobninjas-match-widget').remove()">✕</button>
        </div>
        
        ${isAuthenticated ? `
            <div class="jn-match-content">
                <div class="jn-match-header">
                    <div class="jn-match-text">
                        <div class="jn-match-label">${matchQuality === 'good' ? 'Great Match!' : matchQuality === 'medium' ? 'Medium Match' : 'Low Match'}</div>
                        <div class="jn-match-subtitle">${keywordsMatched} out of ${keywordsTotal} keywords present in your resume</div>
                    </div>
                    <div class="jn-score-circle">
                        <span class="jn-score-value">${score}</span>
                        <span class="jn-score-label">SCORE</span>
                    </div>
                </div>
                ${score < 70 ? `<div class="jn-keywords">Let's optimize your resume to increase your match score!</div>` : ''}
                <button class="jn-cta-btn" id="jn-tailor-btn">
                    <span>✨</span>
                    <span>Tailor Resume</span>
                    <span>→</span>
                </button>
            </div>
        ` : `
            <div class="jn-auth-message">
                <p><strong>Connect your jobNinjas account</strong> to get your match score and AI-powered resume tailoring!</p>
                <button class="jn-cta-btn" id="jn-login-btn">
                    <span>🔑</span>
                    <span>Sign In to jobNinjas</span>
                </button>
            </div>
        `}
        
        <div class="jn-footer">
            Powered by jobNinjas AI
        </div>
    `;

    document.body.appendChild(matchWidget);

    // Add click handlers
    const tailorBtn = matchWidget.querySelector('#jn-tailor-btn');
    const loginBtn = matchWidget.querySelector('#jn-login-btn');

    if (tailorBtn) {
        tailorBtn.addEventListener('click', () => {
            const url = `https://jobninjas.io/ai-apply?job_title=${encodeURIComponent(jobData.title)}&company=${encodeURIComponent(jobData.company)}&url=${encodeURIComponent(jobData.url)}`;
            window.open(url, '_blank');
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.open('https://jobninjas.io/login', '_blank');
        });
    }
}

function removeWidget() {
    if (matchWidget && matchWidget.parentNode) {
        matchWidget.remove();
        matchWidget = null;
    }
}
