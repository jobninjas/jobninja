import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Menu,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Bot,
  Plus,
  Calendar,
  Tag,
  Loader2,
  CheckCircle,
  X,
  Zap,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { BRAND } from '../config/branding';
import { API_URL } from '../config/api';
import SideMenu from './SideMenu';
import Header from './Header';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import './SideMenu.css';

const MyResumes = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usageLimits, setUsageLimits] = useState(null);

  // Custom Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [isDeletingResume, setIsDeletingResume] = useState(false);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/resumes?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes || []);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageLimits = async () => {
    try {
      const response = await fetch(`${API_URL}/api/usage/limits?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setUsageLimits(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage limits:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchResumes();
      fetchUsageLimits();
    }
  }, [isAuthenticated, user?.email]);


  const handleDelete = (id) => {
    setResumeToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDeleteResume = async () => {
    if (!resumeToDelete) return;
    setIsDeletingResume(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/resumes/${resumeToDelete}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'token': token } : {})
        }
      });
      if (response.ok) {
        setResumes(prev => prev.filter(r => r.id !== resumeToDelete && r._id !== resumeToDelete));
      } else {
        console.error('Failed to delete resume from server');
        alert("Failed to delete resume.");
      }
      setDeleteModalOpen(false);
      setResumeToDelete(null);
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert("Error deleting resume.");
    } finally {
      setIsDeletingResume(false);
    }
  };

  const handleStartApplication = (resumeId) => {
    navigate('/ai-ninja', { state: { selectedResumeId: resumeId } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="resumes-page">
        <div className="auth-required">
          <FileText className="w-16 h-16 text-gray-300" />
          <h2>Login Required</h2>
          <p>Please log in to manage your resumes.</p>
          <Button className="btn-primary" onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="resumes-page">
      {/* Side Menu */}
      <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />

      {/* Navigation Header */}
      <Header onMenuClick={() => setSideMenuOpen(true)} />

      {/* Main Content */}
      <main className="resumes-content">
        <div className="container">
          <div className="resumes-header">
            <div>
              <h1>My Resumes</h1>
              <p>View and manage your AI-generated tailored resumes</p>
            </div>
          </div>

          {/* Usage Stats Banner */}
          {usageLimits && (
            <Card className="mb-8 border-orange-200 bg-orange-50/50">
              <CardContent className="py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-900 text-sm md:text-base">
                      {(usageLimits.tier || 'Free').charAt(0).toUpperCase() + (usageLimits.tier || 'free').slice(1)} Tier Usage
                    </h3>
                    <p className="text-orange-700 text-xs md:text-sm">
                      {usageLimits.currentCount} / {usageLimits.limit} resumes generated {usageLimits.tier === 'beginner' ? 'this month' : 'total'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex-1 md:w-48 h-2 bg-orange-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${usageLimits.canGenerate ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (usageLimits.currentCount / (usageLimits.limit === 'Unlimited' ? 1000 : usageLimits.limit)) * 100)}%` }}
                    />
                  </div>
                  {usageLimits.tier !== 'pro' && (
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white border-none h-8 px-4 text-xs font-bold"
                      onClick={() => navigate('/pricing')}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="loading-state">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Loading your resumes...</p>
            </div>
          ) : resumes.filter(r => r.isSystemGenerated || r.resumeName?.startsWith('AI Tailored:') || r.resume_name?.startsWith('AI Tailored:')).length === 0 ? (
            <Card className="empty-state">
              <CardContent className="pt-6 text-center">
                <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3>No tailored resumes yet</h3>
                <p>Tailor your base resume for a job using the Resume Scanner.</p>
                <Button className="btn-primary mt-4" onClick={() => navigate('/scanner')}>
                  <Bot className="w-4 h-4 mr-2" /> Open Resume Scanner
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="resumes-grid">
              {resumes.filter(r => r.isSystemGenerated || r.resumeName?.startsWith('AI Tailored:') || r.resume_name?.startsWith('AI Tailored:')).map(resume => (
                <Card key={resume.id} className={`resume-card ${resume.isBase ? 'base-resume' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="resume-header">
                      <div className="resume-icon">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="resume-actions">
                        <Button variant="ghost" size="sm" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download">
                          <Download className="w-4 h-4" />
                        </Button>
                        {!resume.isBase && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete"
                            onClick={() => handleDelete(resume.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="resume-info">
                      <h3 className="resume-label">
                        {resume.resumeName || resume.label || 'Resume'}
                        {resume.isBase && <Badge className="ml-2">Base</Badge>}
                        {resume.isSystemGenerated && <Badge variant="outline" className="ml-2 border-green-200 bg-green-50 text-green-700">AI Tailored</Badge>}
                      </h3>
                      <p className="resume-filename text-xs text-gray-400 mb-2 truncate">
                        {resume.fileName || `${resume.companyName || 'Resume'}_${resume.jobTitle || ''}.pdf`}
                      </p>

                      <div className="resume-meta">
                        <span className="meta-item">
                          <Calendar className="w-3 h-3" />
                          {formatDate(resume.createdAt)}
                        </span>
                        {resume.companyName && (
                          <span className="meta-item text-primary font-medium">
                            <Briefcase className="w-3 h-3" />
                            {resume.companyName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="resume-footer">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleStartApplication(resume.id)}
                      >
                        <Bot className="w-4 h-4 mr-2" /> Use for New Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>


      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setResumeToDelete(null);
        }}
        onConfirm={executeDeleteResume}
        isDeleting={isDeletingResume}
      />
    </div>
  );
};

export default MyResumes;



