import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import CourseManagement from '../components/admin/CourseManagement';
import GroupManagement from '../components/admin/GroupManagement';
import './AdminDashboardPage.css';

const AdminDashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/groups')) return 'groups';
    return 'courses';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/admin/${tab === 'courses' ? '' : tab}`);
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => handleTabChange('courses')}
        >
          Courses
        </button>
        <button 
          className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => handleTabChange('groups')}
        >
          Groups
        </button>
      </div>
      
      <div className="admin-content">
        <Routes>
          <Route index element={<CourseManagement />} />
          <Route path="groups" element={<GroupManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
