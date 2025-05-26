import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [coursesResponse, gradesResponse] = await Promise.all([
          api.get('/users/courses'),
          api.get('/grades/my')
        ]);
        setEnrolledCourses(coursesResponse.data);
        setGrades(gradesResponse.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleRemoveCourse = async (courseId) => {
    try {
      await api.delete(`/users/courses/${courseId}`);
      setEnrolledCourses(prev => prev.filter(course => course.id !== courseId));
      toast.success('Course removed successfully');
    } catch (err) {
      console.error('Error removing course:', err);
      toast.error('Failed to remove course');
    }
  };

  const handleRemoveGrade = async (gradeId) => {
    try {
      await api.delete(`/grades/${gradeId}`);
      setGrades(prev => prev.filter(grade => grade.id !== gradeId));
      toast.success('Grade removed successfully');
    } catch (err) {
      console.error('Error removing grade:', err);
      toast.error('Failed to remove grade');
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile data...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-card">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h1>{user.name}</h1>
            <p className="user-email">{user.email}</p>
            <span className={`user-role ${user.role.toLowerCase()}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        <section className="courses-section">
          <h2 className="section-title">
            <i className="fas fa-book"></i> My Courses
          </h2>
          
          {enrolledCourses.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-book-open"></i>
              <p>You are not enrolled in any courses</p>
            </div>
          ) : (
            <div className="courses-grid">
              {enrolledCourses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-content">
                    <h3>{course.name}</h3>
                    <p>{course.description || 'No description available'}</p>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveCourse(course.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grades-section">
          <h2 className="section-title">
            <i className="fas fa-chart-bar"></i> My Grades
          </h2>
          
          {grades.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-chart-line"></i>
              <p>You don't have any grades yet</p>
            </div>
          ) : (
            <div className="grades-table-container">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Group</th>
                    <th>Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map(grade => (
                    <tr key={grade.id}>
                      <td>{grade.course?.name || 'N/A'}</td>
                      <td>{grade.group?.name || 'N/A'}</td>
                      <td>
                        <span className={`grade-value ${getGradeClass(grade.value)}`}>
                          {grade.value}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="action-btn danger"
                          onClick={() => handleRemoveGrade(grade.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );

  function getGradeClass(grade) {
    if (grade >= 90) return 'excellent';
    if (grade >= 75) return 'good';
    if (grade >= 60) return 'average';
    return 'poor';
  }
};

export default ProfilePage;