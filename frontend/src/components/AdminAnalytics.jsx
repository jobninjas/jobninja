import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
    Users,
    FileText,
    Video,
    TrendingUp,
    Calendar,
    Activity,
    Loader2
} from 'lucide-react';
import { API_URL } from '../config/api';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/analytics`, {
                headers: {
                    'token': localStorage.getItem('auth_token')
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const data = await response.json();
            setAnalytics(data.data);
        } catch (err) {
            console.error('Analytics fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-analytics-container">
                <div className="loading-state">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                    <p className="mt-4 text-lg">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-analytics-container">
                <Card className="error-card">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">Error</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={fetchAnalytics}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const stats = [
        {
            title: 'Total Users',
            value: analytics?.users?.total || 0,
            recent: analytics?.users?.recent_30d || 0,
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Total Applications',
            value: analytics?.applications?.total || 0,
            recent: analytics?.applications?.recent_30d || 0,
            icon: FileText,
            color: 'green'
        },
        {
            title: 'Interview Sessions',
            value: analytics?.interviews?.total_sessions || 0,
            recent: analytics?.interviews?.recent_30d || 0,
            icon: Video,
            color: 'purple'
        },
        {
            title: 'Active Users (30d)',
            value: analytics?.engagement?.active_users_30d || 0,
            recent: null,
            icon: Activity,
            color: 'orange'
        }
    ];

    return (
        <div className="admin-analytics-container">
            <div className="admin-analytics-content">
                <div className="analytics-header">
                    <h1 className="analytics-title">Admin Analytics Dashboard</h1>
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>

                {/* Quick Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} className={`stat-card stat-${stat.color}`}>
                                <CardContent className="p-6">
                                    <div className="stat-icon-wrapper">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <div className="stat-content">
                                        <p className="stat-label">{stat.title}</p>
                                        <h3 className="stat-value">{stat.value.toLocaleString()}</h3>
                                        {stat.recent !== null && (
                                            <p className="stat-recent">
                                                +{stat.recent} in last 30 days
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Application Status Breakdown */}
                {analytics?.applications?.by_status && Object.keys(analytics.applications.by_status).length > 0 && (
                    <Card className="breakdown-card">
                        <CardHeader>
                            <CardTitle>Applications by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="status-breakdown">
                                {Object.entries(analytics.applications.by_status).map(([status, count]) => (
                                    <div key={status} className="status-item">
                                        <span className="status-label">{status || 'pending'}</span>
                                        <span className="status-count">{count.toLocaleString()}</span>
                                        <div className="status-bar">
                                            <div
                                                className="status-bar-fill"
                                                style={{
                                                    width: `${(count / analytics.applications.total) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Refresh Button */}
                <div className="analytics-footer">
                    <Button onClick={fetchAnalytics} className="btn-primary">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Refresh Data
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
