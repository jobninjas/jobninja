// background.js - Orchestrates auth, data fetching, and cross-frame communication
const API_BASE_URL = 'https://nova-ninjas-production.up.railway.app';

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 1. Auth & Data Retrieval
    if (message.type === 'GET_AUTH_TOKEN') {
        handleGetAuthToken(sendResponse);
        return true;
    }

    // 2. Cross-Frame Broadcast
    if (message.type === 'BROADCAST_AUTOFILL') {
        const tabId = sender.tab.id;
        chrome.webNavigation.getAllFrames({ tabId: tabId }, (frames) => {
            frames.forEach(frame => {
                chrome.tabs.sendMessage(tabId, { type: 'START_AUTOFILL', data: message.data }, { frameId: frame.frameId });
            });
        });
        return false;
    }

    // 3. Message Forwarding (From frames to Top-Frame Sidebar)
    if (message.type === 'FIELD_FILLED' || message.type === 'AUTOFILL_TOTAL' || message.type === 'AUTOFILL_SCAN_COMPLETE') {
        if (sender.tab && sender.tab.id) {
            // Forward to top frame (frameId: 0)
            chrome.tabs.sendMessage(sender.tab.id, message, { frameId: 0 });
        }
        return false;
    }

    // 4. UI Controls
    if (message.type === 'TOGGLE_SIDEBAR') {
        if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, { type: 'TOGGLE_SIDEBAR' }, { frameId: 0 });
        }
        return false;
    }

    if (message.type === 'OPEN_SIDE_PANEL') {
        if (sender.tab && sender.tab.id) {
            chrome.sidePanel.open({ tabId: sender.tab.id });
        }
        return false;
    }

    // 5. Resume Upload
    if (message.type === 'UPLOAD_RESUME') {
        handleResumeUpload(message.payload, sendResponse);
        return true; // Async
    }

    // 6. Smart Answer Generation
    if (message.type === 'GENERATE_SMART_ANSWER') {
        handleSmartAnswer(message.payload, sendResponse);
        return true; // Async
    }

    return false;
});

async function handleGetAuthToken(sendResponse) {
    // Try storage first
    const { auth_token, user_data } = await chrome.storage.local.get(['auth_token', 'user_data']);

    let token = auth_token;
    let userData = user_data ? (typeof user_data === 'string' ? JSON.parse(user_data) : user_data) : null;

    // Fallback: check tabs if storage is empty or stale
    if (!token) {
        const tabs = await chrome.tabs.query({ url: ["*://*.jobninjas.ai/*", "*://*.jobninjas.org/*", "*://*.jobninjas.com/*", "*://*.jobninjas.io/*"] });
        const activeTabs = tabs.filter(t => t.id && t.url && !t.url.startsWith('chrome'));

        if (activeTabs.length > 0) {
            const res = await new Promise(resolve => {
                chrome.tabs.sendMessage(activeTabs[0].id, { type: 'GET_AUTH_TOKEN' }, (r) => {
                    if (chrome.runtime.lastError) resolve(null);
                    else resolve(r);
                });
            });
            if (res && res.token) {
                token = res.token;
                userData = res.userData;
                // Save to storage for next time
                chrome.storage.local.set({ 'auth_token': token, 'user_data': userData });
            }
        }
    }

    if (!token) {
        sendResponse({ error: 'No session' });
        return;
    }

    // Always attempt to fetch full profile and latest resume to ensure autofill has data
    try {
        const profileRes = await fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { 'token': token }
        });
        if (profileRes.ok) {
            const pData = await profileRes.json();
            if (pData && pData.profile) {
                userData = { ...userData, ...pData.profile };
            }
        }

        const resumeRes = await fetch(`${API_BASE_URL}/api/resumes?email=${encodeURIComponent(userData?.email || '')}`, {
            headers: { 'token': token }
        });
        if (resumeRes.ok) {
            const rData = await resumeRes.json();
            if (rData && rData.resumes && rData.resumes.length > 0) {
                userData.latestResume = rData.resumes[0];
            }
        }

        // Update storage with full data
        chrome.storage.local.set({ 'user_data': userData });
    } catch (e) {
        console.warn('[jobNinjas] Background data refresh failed:', e);
    }

    sendResponse({ token, userData });
}

async function handleResumeUpload(payload, sendResponse) {
    try {
        const { name, type, data, token } = payload;

        // Convert base64 to blob
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type });
        const file = new File([blob], name, { type });

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
            method: 'POST',
            headers: {
                'token': token
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            sendResponse({ success: true, userData: result.userData });
        } else {
            const err = await response.text();
            sendResponse({ success: false, error: err });
        }
    } catch (error) {
        console.error('Upload error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleSmartAnswer(payload, sendResponse) {
    try {
        const { question, context, token } = payload;

        const response = await fetch(`${API_BASE_URL}/api/llm/generate-answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ question, context })
        });

        if (response.ok) {
            const result = await response.json();
            sendResponse({ success: true, answer: result.answer });
        } else {
            sendResponse({ success: false, error: 'Failed to generate answer' });
        }
    } catch (error) {
        console.error('LLM error:', error);
        sendResponse({ success: false, error: error.message });
    }
}
