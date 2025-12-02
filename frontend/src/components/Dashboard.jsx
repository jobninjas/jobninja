import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, Target, Users, Clock, LogOut, Settings, CreditCard, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({
    applicationsThisWeek: 0,
    totalJobsApplied: 0,
    interviews: 0,
    hoursSaved: 0
  });
  
  // Fetch applications from Google Sheets via backend
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.email) return;
      
      try {
        setIsLoading(true);
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${BACKEND_URL}/api/applications/${encodeURIComponent(user.email)}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Transform applications to match component format
          const formattedApps = data.applications.map((app, index) => ({
            id: index + 1,
            company: app.company_name,
            role: app.job_title,
            status: app.status,
            applicationLink: app.application_link,
            date: app.submitted_date
          }));
          
          setApplications(formattedApps);
          setKpis({
            applicationsThisWeek: data.stats.this_week || 0,
            totalJobsApplied: data.stats.total || 0,
            interviews: data.stats.interviews || 0,
            hoursSaved: Math.round(data.stats.hours_saved || 0)
          });
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
    
    // Refresh data every 2 minutes
    const interval = setInterval(fetchApplications, 120000);
    return () => clearInterval(interval);
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const variants = {
      found: 'default',
      prepared: 'secondary',
      submitted: 'success',
      interview: 'warning',
      offer: 'success',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <button onClick={() => navigate('/')} className="flex items-center gap-2">
                <img src="/logo.png" alt="Nova Ninjas" className="h-8" />
                <span className="text-xl font-bold text-primary">Nova Ninjas</span>
              </button>
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <Badge>{user?.plan || 'No Plan'}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('settings')}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Our Applications This Week</p>
                  <p className="text-3xl font-bold mt-1">{kpis.applicationsThisWeek.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Jobs Applied</p>
                  <p className="text-3xl font-bold mt-1">{kpis.totalJobsApplied.toLocaleString()}</p>
                </div>
                <Target className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Interviews</p>
                  <p className="text-3xl font-bold mt-1">{kpis.interviews}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hours Saved</p>
                  <p className="text-3xl font-bold mt-1">{kpis.hoursSaved}h</p>
                </div>
                <Clock className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'pipeline'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Pipeline
                  </button>
                  <button
                    onClick={() => setActiveTab('queue')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'queue'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Approve & Submit Queue
                  </button>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'billing'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Billing & Subscription
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'settings'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Settings
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'pipeline' && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Company</th>
                          <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Role</th>
                          <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                              <p className="text-sm text-gray-500 mt-2">Loading applications...</p>
                            </td>
                          </tr>
                        ) : applications.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center">
                              <p className="text-gray-500">No applications yet.</p>
                              <p className="text-sm text-gray-400 mt-1">Our team is working on finding jobs for you!</p>
                            </td>
                          </tr>
                        ) : (
                          applications.map((app) => (
                            <tr key={app.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{app.company}</td>
                              <td className="py-3 px-4">{app.role}</td>
                              <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{app.date}</td>
                              <td className="py-3 px-4">
                                <a
                                  href={app.applicationLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-sm"
                                >
                                  View
                                </a>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'queue' && (
              <Card>
                <CardHeader>
                  <CardTitle>Approve & Submit Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Review prepared applications before submission.</p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
                    This section will show applications that are ready for your approval.
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'billing' && (
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Plan</p>
                      <p className="text-2xl font-bold">{user?.plan || 'No Plan Selected'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Renewal</p>
                      <p className="text-lg">February 24, 2025</p>
                    </div>
                    <div className="pt-4">
                      <Button onClick={() => navigate('/pricing')}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Change Plan
                      </Button>
                      <Button variant="outline" className="ml-2">
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Profile and preferences settings coming soon.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
