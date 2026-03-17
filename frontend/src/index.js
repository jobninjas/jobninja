import React from "react";
// Force redeploy v3 - 2026-01-15
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { GoogleOAuthProvider } from '@react-oauth/google';
import posthog from 'posthog-js';

// PostHog Initialization
if (process.env.REACT_APP_POSTHOG_KEY) {
  posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
    api_host: process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'always',
    capture_pageview: true,
  });

  // Global Button Click Tracking
  document.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) {
      posthog.capture('button_click', {
        button_text: button.innerText || button.getAttribute('aria-label') || 'unlabeled_button',
        url: window.location.href
      });
    }
  });

  // Global Form Submission Tracking
  document.addEventListener('submit', (e) => {
    const form = e.target;
    posthog.capture('form_submission', {
      form_id: form.id || 'unnamed_form',
      form_action: form.action,
      url: window.location.href
    });
  });

  // Scroll Depth Tracking
  let scrollMarks = { 25: false, 50: false, 75: false, 100: false };
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;

    [25, 50, 75, 100].forEach(mark => {
      if (scrollPercent >= mark && !scrollMarks[mark]) {
        scrollMarks[mark] = true;
        posthog.capture('scroll_depth', { depth: mark + '%' });
      }
    });
  });

  // Outbound Link Tracking
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.hostname && link.hostname !== window.location.hostname) {
      posthog.capture('outbound_link_click', {
        destination: link.href,
        link_text: link.innerText || 'unlabeled_link'
      });
    }
  });
}

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '62316419452-e4gpepiaepopnfqpd96k19r1ps6e777v.apps.googleusercontent.com';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
/* Cache bust 2026-01-22 */
