import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminCourses from './AdminCourses';
import AdminGroups from './AdminGroups';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Add debugging
  useEffect(() => {
    console.log('AdminDashboard mounted');
    console.log('User:', user);
    console.log('User role:', user?.role);
    console.log('Is admin check:', user?.role === 'ADMIN');
    
    return () => {
      console.log('AdminDashboard unmounted');
    };
  }, [user]);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      console.log('Not admin, redirecting to home');
      navigate('/');
    }
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('No user, redirecting to login');
    navigate('/login');
    return null;
  }

  if (user.role !== 'ADMIN') {
    console.log('Not admin, access denied');
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Manage Courses
        </button>
        <button 
          className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Manage Groups
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'courses' && <AdminCourses />}
        {activeTab === 'groups' && <AdminGroups />}
      </div>
    </div>
  );
};

export default AdminDashboard;