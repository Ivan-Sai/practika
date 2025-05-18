import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import GradeHistogram from '../components/GradeHistogram';

const HomePage = () => {
  const [publicCourses, setPublicCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalGrades, setTotalGrades] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPublicCourses = async () => {
      try {
        const response = await api.get('/courses/public');
        setPublicCourses(response.data);
        
        // Calculate total grades
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Paranormal Distribution</h1>
        <p>Visualize grade distributions across courses and groups</p>
        <div className="hero-buttons">
          <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className="btn btn-secondary" style={{ marginLeft: '10px' }}>Admin Dashboard</Link>
          )}
        </div>
      </div>

      <div className="stats-section">
        <div className="card">
          <h2>Platform Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>{publicCourses.length}</h3>
              <p>Public Courses</p>
            </div>
            <div className="stat-item">
              <h3>{totalGrades}</h3>
              <p>Total Grades</p>
            </div>
          </div>
        </div>
      </div>

      {publicCourses.length > 0 && (
        <div className="featured-courses">
          <h2>Featured Public Courses</h2>
          <div className="course-list">
            {publicCourses.slice(0, 3).map(course => (
              <div key={course.id} className="card course-card">
                <h3>{course.name}</h3>
                <p>{course.description}</p>
                <Link to={`/courses/${course.id}`} className="btn btn-primary">View Distribution</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;