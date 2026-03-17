import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  FileText,
  Target,
  Briefcase,
  Upload,
  Play,
  Loader2,
  CheckCircle,
  Mic
} from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import SideMenu from './SideMenu';
import Header from './Header';
import SubscriptionWall from './SubscriptionWall';
import './SideMenu.css';
import './InterviewPrep.css';

const InterviewPrep = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreateSession = async () => {
    if (!file || !roleTitle) return;

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jd', jd);
      formData.append('roleTitle', roleTitle);

      const response = await fetch(`${API_URL}/api/interview/create-session`, {
        method: 'POST',
        headers: {
          'token': localStorage.getItem('auth_token')
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Failed to create session: ${response.status} - ${errorText}`);
        return;
      }

      const data = await response.json();
      if (data.sessionId && data.sessionId !== 'None') {
        navigate(`/interview-prep/${data.sessionId}`);
      } else {
        alert('Failed to create session. Please try again.');
      }
    } catch (error) {
      alert('Network error. Make sure the interview service is running.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SubscriptionWall>
      <div className="interview-prep-page">
        <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
        <Header onMenuClick={() => setSideMenuOpen(true)} />

        <main className="interview-prep-content">
          <div className="container">

            {/* Page Header */}
            <div className="interview-prep-header">
              <div className="interview-prep-title-row">
                <div className="interview-icon-badge">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h1>AI Interview Prep</h1>
                  <p>Practice with our real-time voice interviewer grounded in your resume.</p>
                </div>
              </div>
            </div>

            {/* Setup Card */}
            <div className="interview-setup-card">
              <div className="setup-sections">

                {/* Role */}
                <div className="ip-section">
                  <label className="ip-section-label">
                    <Briefcase className="w-4 h-4 text-primary" />
                    What role are you practicing for?
                  </label>
                  <Input
                    placeholder="e.g. Senior Product Manager"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="ip-input"
                  />
                </div>

                {/* Resume Upload */}
                <div className="ip-section">
                  <label className="ip-section-label">
                    <FileText className="w-4 h-4 text-primary" />
                    Upload your Resume
                  </label>
                  <div
                    className={`ip-upload-zone ${file ? 'has-file' : ''}`}
                    onClick={() => document.getElementById('resume-upload').click()}
                  >
                    {file ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <p className="ip-upload-filename">{file.name}</p>
                        <p className="ip-upload-hint">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="ip-upload-text">Click to upload <span>PDF</span> or <span>DOCX</span></p>
                      </>
                    )}
                    <input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div className="ip-section">
                  <label className="ip-section-label">
                    <Target className="w-4 h-4 text-primary" />
                    Paste Job Description
                    <span className="ip-optional-badge">Optional</span>
                  </label>
                  <textarea
                    placeholder="Paste the full job details here to get targeted questions..."
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    className="ip-textarea"
                  />
                </div>

                <Button
                  className="btn-primary w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
                  onClick={handleCreateSession}
                  disabled={!file || !roleTitle || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Preparing Interview...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Mock Interview
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </SubscriptionWall>
  );
};

export default InterviewPrep;
