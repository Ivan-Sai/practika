import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const [publicCourses, setPublicCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalGrades, setTotalGrades] = useState(0);

  useEffect(() => {
    const fetchPublicCourses = async () => {
      try {
        const response = await api.get('/courses/public');
        setPublicCourses(response.data);
        
        let total = 0;
        response.data.forEach(course => {
          if (course.gradesCount) {
            total += course.gradesCount;
          }
        });
        setTotalGrades(total);
      } catch (err) {
        console.error('Error fetching public courses:', err);
        setError('Failed to load public courses');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCourses();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to GradeVision</h1>
          <p className="hero-subtitle">Analyze and visualize academic performance across courses</p>
          <div className="hero-buttons">
            <Link to="/courses" className="btn btn-primary">
              Browse Courses
            </Link>
            {user && user.role === 'ADMIN' && (
              <Link to="/admin" className="btn btn-secondary">
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <h3>{publicCourses.length}</h3>
            <p>Public Courses</p>
          </div>
          <div className="stat-card">
            <h3>{totalGrades}</h3>
            <p>Total Grades</p>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="featured-courses-section">
        <div className="section-header">
          <h2 className="section-title">Featured Public Courses</h2>
          <div className="section-divider"></div>
        </div>

        <div className="courses-grid">
          {publicCourses.slice(0, 3).map(course => (
            <div key={course.id} className="course-card" 
                 style={{ '--course-color': getCourseColor(course.name) }}>
              <div className="course-icon">
                <i className={getCourseIcon(course.name)}></i>
              </div>
              <div className="course-content">
                <h3>{course.name}</h3>
                <p className="course-description">
                  {course.description || 'No description available'}
                </p>
                <Link to={`/courses/${course.id}`} className="course-link">
                  View Distribution <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  // Helper functions for course styling
  function getCourseColor(courseName) {
    const colors = {
      'Mathematics': '#3498db',
      'Physics': '#e74c3c',
      'Computer Science': '#2ecc71',
      'Chemistry': '#9b59b6',
      'Biology': '#1abc9c',
      'default': '#6e48aa'
    };
    
    return colors[courseName] || colors.default;
  }

  function getCourseIcon(courseName) {
    const icons = {
      'Mathematics': 'fas fa-square-root-alt',
      'Physics': 'fas fa-atom',
      'Computer Science': 'fas fa-laptop-code',
      'Chemistry': 'fas fa-flask',
      'Biology': 'fas fa-dna',
      'default': 'fas fa-book-open'
    };
    
    return icons[courseName] || icons.default;
  }
};

export default HomePage;