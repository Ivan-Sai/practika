import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch enrolled courses
        const coursesResponse = await api.get('/users/courses');
        setEnrolledCourses(coursesResponse.data);

        // Fetch user's grades
        const gradesResponse = await api.get('/grades/my');
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
      setError('Failed to remove course');
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
      setError('Failed to remove grade');
      toast.error('Failed to remove grade');
    }
  };

  if (loading) {
    return <div>Loading profile data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="user-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      </div>

      <div className="enrolled-courses">
        <h2>My Courses</h2>
        {enrolledCourses.length === 0 ? (
          <p>You are not enrolled in any courses.</p>
        ) : (
          <div className="course-list">
            {enrolledCourses.map(course => (
              <div key={course.id} className="card">
                <h3>{course.name}</h3>
                <p>{course.description}</p>
                <div className="course-actions">
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleRemoveCourse(course.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="my-grades">
        <h2>My Grades</h2>
        {grades.length === 0 ? (
          <p>You don't have any grades yet.</p>
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
                    <td>{grade.course.name}</td>
                    <td>{grade.group?.name || 'N/A'}</td>
                    <td>{grade.value}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveGrade(grade.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;