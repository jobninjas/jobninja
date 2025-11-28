import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Shield, LogOut } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <img src="/logo.png" alt="Nova Ninjas" className="h-8" />
              <span className="text-xl font-bold text-primary">Nova Ninjas</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Admin: {user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">Admin Console</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-gray-600">
              Coming Soon
            </p>
            <div className="p-6 bg-gray-50 rounded-lg text-left">
              <h3 className="font-semibold mb-3">Planned Features:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• System-wide KPIs and metrics</li>
                <li>• Customer management and assignment</li>
                <li>• Employee performance tracking</li>
                <li>• Billing and subscription management</li>
                <li>• Failed payment notifications</li>
                <li>• Audit logs and activity monitoring</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 italic">
              This console will provide full system oversight and management capabilities.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
