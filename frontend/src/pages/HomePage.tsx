import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './HomePage.css';

interface Course {
  id: string;
  name: string;
  description?: string;
  gradesCount?: number;
}

interface User {
  name: string;
  email: string;
  role: string;
}

const HomePage: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const [publicCourses, setPublicCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalGrades, setTotalGrades] = useState<number>(0);

  useEffect(() => {
    const fetchPublicCourses = async () => {
      try {
        const response = await api.get('/courses/public');
        setPublicCourses(response.data);
        
        const total = response.data.reduce((sum: number, course: Course) => {
          return sum + (course.gradesCount || 0);
        }, 0);
        
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

  const getCourseColor = (courseName: string): string => {
    const colors: Record<string, string> = {
      'Mathematics': '#3498db',
      'Physics': '#e74c3c',
      'Computer Science': '#2ecc71',
      'Chemistry': '#9b59b6',
      'Biology': '#1abc9c',
      'default': '#6e48aa'
    };
    return colors[courseName] || colors.default;
  };

  const getCourseIcon = (courseName: string): string => {
    const icons: Record<string, string> = {
      'Mathematics': 'fas fa-square-root-alt',
      'Physics': 'fas fa-atom',
      'Computer Science': 'fas fa-laptop-code',
      'Chemistry': 'fas fa-flask',
      'Biology': 'fas fa-dna',
      'default': 'fas fa-book-open'
    };
    return icons[courseName] || icons.default;
  };

  const truncateDescription = (desc?: string): string => {
    if (!desc) return 'No description available';
    return desc.length > 80 ? `${desc.substring(0, 80)}...` : desc;
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to GradeVision</h1>
          <p className="hero-subtitle">Analyze and visualize academic performance across courses</p>
          <div className="hero-buttons">
            <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="btn btn-secondary">Admin Dashboard</Link>
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
          {publicCourses.slice(0, 3).map((course) => (
            <div key={course.id} className="course-card" 
                 style={{ '--course-color': getCourseColor(course.name) } as React.CSSProperties}>
              <div className="course-content-wrapper">
                <div className="course-icon-container">
                  <i className={`${getCourseIcon(course.name)} course-icon`}></i>
                </div>
                <div className="course-text-content">
                  <h3>{course.name}</h3>
                  <p className="course-description">{truncateDescription(course.description)}</p>
                  <Link to={`/courses/${course.id}`} className="course-link">
                    View Distribution <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;