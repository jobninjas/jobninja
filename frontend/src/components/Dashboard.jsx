import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, Target, Users, Clock, LogOut, Settings, CreditCard } from 'lucide-react';

// Mock applications data - TODO: Replace with real API call
const mockApplications = [
  {
    id: 1,
    company: 'Acme Corp',
    role: 'Senior Software Engineer',
    status: 'submitted',
    applicationLink: 'https://acme.com/careers/12345',
    date: '2025-01-23'
  },
  {
    id: 2,
    company: 'TechStart Inc',
    role: 'Full Stack Developer',
    status: 'prepared',
    applicationLink: 'https://techstart.com/jobs/67890',
    date: '2025-01-24'
  },
  {
    id: 3,
    company: 'CloudScale',
    role: 'Backend Engineer',
    status: 'found',
    applicationLink: 'https://cloudscale.com/careers',
    date: '2025-01-24'
  },
  {
    id: 4,
    company: 'DataFlow Systems',
    role: 'Software Engineer',
    status: 'interview',
    applicationLink: 'https://dataflow.com/jobs',
    date: '2025-01-20'
  },
  {
    id: 5,
    company: 'AI Innovations',
    role: 'Machine Learning Engineer',
    status: 'submitted',
    applicationLink: 'https://aiinnovations.com',
    date: '2025-01-22'
  }
];

// Base KPI values that auto-increment every 10 minutes
const BASE_KPI_VALUES = {
  applicationsThisWeek: 124,
  totalJobsApplied: 1064,
  interviews: 3,
  hoursSaved: 224
};

// Get auto-incremented KPI values
const getAutoIncrementedKPIs = () => {
  const STORAGE_KEY = 'nova_squad_kpi_timestamp';
  const VERSION_KEY = 'nova_squad_kpi_version';
  const CURRENT_VERSION = '2'; // Increment this to reset counters
  const INCREMENT_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
  
  // Check if version changed, reset timestamp if so
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== CURRENT_VERSION) {
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }
  
  // Get or set initial timestamp
  let initialTimestamp = localStorage.getItem(STORAGE_KEY);
  if (!initialTimestamp) {
    initialTimestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, initialTimestamp);
  } else {
    initialTimestamp = parseInt(initialTimestamp);
  }
  
  // Calculate elapsed time and increments
  const elapsed = Date.now() - initialTimestamp;
  const incrementCount = Math.floor(elapsed / INCREMENT_INTERVAL);
  
  return {
    applicationsThisWeek: BASE_KPI_VALUES.applicationsThisWeek + incrementCount,
    totalJobsApplied: BASE_KPI_VALUES.totalJobsApplied + incrementCount,
    interviews: BASE_KPI_VALUES.interviews,
    hoursSaved: BASE_KPI_VALUES.hoursSaved
  };
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [kpis, setKpis] = useState(getAutoIncrementedKPIs());
  
  // Update KPIs every minute to show real-time increments
  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(getAutoIncrementedKPIs());
    }, 60000); // Update every 1 minute
    
    return () => clearInterval(interval);
  }, []);

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
                        {mockApplications.map((app) => (
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
                        ))}
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
