import React from "react";
import "./App.css";
import "./LandingPage.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import posthog from "posthog-js";
import { AuthProvider } from "./contexts/AuthContext";
import { AINinjaProvider } from "./contexts/AINinjaContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Pricing from "./components/Pricing";
import Employee from "./components/Employee";
import Admin from "./components/Admin";
import AdminDashboard from "./components/AdminDashboard";
import AdminPortal from "./components/AdminPortal";
import AllUsersExport from "./components/AllUsersExport";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentCanceled from "./components/PaymentCanceled";
import LiveDashboard from "./components/LiveDashboard";
// AI Ninja and Human Ninja components
import AINinja from "./components/AINinja";
import JobDetail from "./components/JobDetail";
import JobDetailsOrion from "./components/JobDetailsOrion";
import AIApply from "./components/AIApply";
import HumanNinja from "./components/HumanNinja";
// New components
import Jobs from "./components/Jobs";
import MyResumes from "./components/MyResumes";
import InterviewPrep from "./components/InterviewPrep";
import InterviewRoom from "./components/InterviewRoom";
import InterviewReport from "./components/InterviewReport";
import AdminAnalytics from "./components/AdminAnalytics";
import Checkout from "./components/Checkout";
import ResumeEditorPage from "./components/ResumeEditorPage";
import AIApplyFlow from "./components/AIApplyFlow";
import RefundPolicy from "./components/RefundPolicy";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions";
import VerifyEmail from "./components/VerifyEmail";
import ScrollToTop from "./components/ScrollToTop";
// Phase 1 Tools
import OneClickOptimize from "./components/OneClickOptimize";
import BulletPointsGenerator from "./components/BulletPointsGenerator";
import SummaryGenerator from "./components/SummaryGenerator";
import LinkedInOptimizer from "./components/LinkedInOptimizer";
import CareerChangeTool from "./components/CareerChangeTool";
// Phase 2 Tools
import ChatGPTResume from "./components/ChatGPTResume";
import ChatGPTCoverLetter from "./components/ChatGPTCoverLetter";
import LinkedInExamples from "./components/LinkedInExamples";
// Phase 3 Tools
import ResumeTemplates from "./components/ResumeTemplates";
import CoverLetterTemplates from "./components/CoverLetterTemplates";
import ATSGuides from "./components/ATSGuides";
// Removed FreeTools import
// Free Tools Components
import NetworkingTemplates from "./components/NetworkingTemplates";
import InterviewFramework from "./components/InterviewFramework";
import ReferenceCheckPrep from "./components/ReferenceCheckPrep";
import SalaryNegotiator from "./components/SalaryNegotiator";
import LinkedInHeadlineOptimizer from "./components/LinkedInHeadlineOptimizer";
import CareerGapExplainer from "./components/CareerGapExplainer";
import JobDescriptionDecoder from "./components/JobDescriptionDecoder";
import OfferComparator from "./components/OfferComparator";
import ContactPage from "./components/ContactPage";
import "./components/Jobs.css";
import "./components/InterviewPrep.css";
import "./components/AIApplyFlow.css";
import LinkedInMockup from "./components/LinkedInMockup";
import DashboardLayout from "./components/DashboardLayout";

// Initialize PostHog
if (process.env.REACT_APP_POSTHOG_KEY) {
  posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
    api_host: process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
  });
}

function App() {
  // Global Event Tracking
  React.useEffect(() => {
    const handleButtonClick = (e) => {
      const target = e.target.closest('button, a.btn, .clickable-element');
      if (target) {
        posthog.capture('button_clicked', {
          text: target.innerText || target.getAttribute('aria-label'),
          id: target.id,
          class: target.className
        });
      }
    };

    const handleFormSubmit = (e) => {
      posthog.capture('form_submitted', {
        form_id: e.target.id,
        action: e.target.action
      });
    };

    const handleScroll = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
      if (scrollPercent > 90) posthog.capture('scroll_depth', { depth: '90%' });
      else if (scrollPercent > 50) posthog.capture('scroll_depth', { depth: '50%' });
    };

    document.addEventListener('click', handleButtonClick);
    document.addEventListener('submit', handleFormSubmit);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleButtonClick);
      document.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="App">
      <ErrorBoundary>
        <AuthProvider>
          <AINinjaProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Standalone Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/canceled" element={<PaymentCanceled />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Internal App Routes (Wrapped in DashboardLayout) */}
                <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} requireVerification={false}><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/ai-ninja" element={<AINinja />} />
                  <Route path="/ai-ninja/jobs/:id" element={<JobDetailsOrion />} />
                  <Route path="/ai-ninja/apply/:id" element={<AIApply />} />
                  <Route path="/ai-apply" element={<AIApplyFlow />} />
                  <Route path="/human-ninja" element={<HumanNinja />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/resumes" element={<MyResumes />} />
                  <Route path="/interview-prep" element={<InterviewPrep />} />
                  <Route path="/interview-prep/:sessionId" element={<InterviewRoom />} />
                  <Route path="/interview-prep/:sessionId/report" element={<InterviewReport />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/one-click-optimize" element={<OneClickOptimize />} />
                  <Route path="/bullet-points" element={<BulletPointsGenerator />} />
                  <Route path="/summary-generator" element={<SummaryGenerator />} />
                  <Route path="/linkedin-optimizer" element={<LinkedInOptimizer />} />
                  <Route path="/career-change" element={<CareerChangeTool />} />
                  <Route path="/chatgpt-resume" element={<ChatGPTResume />} />
                  <Route path="/chatgpt-cover-letter" element={<ChatGPTCoverLetter />} />
                  <Route path="/scanner" element={<ResumeEditorPage />} />
                  <Route path="/editor" element={<ResumeEditorPage />} />
                  
                  {/* Tools and Guides */}
                  <Route path="/networking-templates" element={<NetworkingTemplates />} />
                  <Route path="/interview-framework" element={<InterviewFramework />} />
                  <Route path="/reference-prep" element={<ReferenceCheckPrep />} />
                  <Route path="/salary-negotiator" element={<SalaryNegotiator />} />
                  <Route path="/linkedin-headline" element={<LinkedInHeadlineOptimizer />} />
                  <Route path="/career-gap" element={<CareerGapExplainer />} />
                  <Route path="/job-decoder" element={<JobDescriptionDecoder />} />
                  <Route path="/offer-comparator" element={<OfferComparator />} />
                  <Route path="/linkedin-examples" element={<LinkedInExamples />} />
                  <Route path="/resume-examples" element={<LinkedInExamples />} />
                  <Route path="/linkedin-mockup" element={<LinkedInMockup />} />
                  <Route path="/resume-templates" element={<ResumeTemplates />} />
                  <Route path="/cover-letter-templates" element={<CoverLetterTemplates />} />
                  <Route path="/ats-guides" element={<ATSGuides />} />
                </Route>

                {/* Admin/Employee Portal (Standalone) */}
                <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><Employee /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute> } />
                <Route path="/job-ninjas-admin-portal" element={<AdminPortal />} />
                <Route path="/live-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><LiveDashboard /></ProtectedRoute>} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AINinjaProvider>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
