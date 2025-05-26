import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import GradeHistogram from '../components/GradeHistogram';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNormalDistribution, setShowNormalDistribution] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course details
        const courseResponse = await api.get(`/courses/${courseId}`);
        setCourse(courseResponse.data);

        // Fetch groups for this course
        const groupsResponse = await api.get(`/courses/${courseId}/groups`);
        setGroups(groupsResponse.data);

        // Fetch initial distribution (all groups)
        const distributionResponse = await api.get(`/grades/course/${courseId}/distribution`);
        setDistribution(distributionResponse.data);
        
        // Check if user is enrolled
        if (isAuthenticated && user.role === 'STUDENT') {
          try {
            const enrollmentResponse = await api.get('/users/courses');
            const isUserEnrolled = enrollmentResponse.data.some(c => c.id === parseInt(courseId));
            setIsEnrolled(isUserEnrolled);
          } catch (err) {
            console.error('Error checking enrollment:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data');
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, isAuthenticated, user]);

  const handleGroupChange = async (groupId) => {
    try {
      setLoading(true);
      let distributionResponse;

      if (groupId) {
        setSelectedGroup(groupId);
        distributionResponse = await api.get(`/grades/course/${courseId}/group/${groupId}/distribution`);
        toast.info(`Showing distribution for selected group`);
      } else {
        setSelectedGroup(null);
        distributionResponse = await api.get(`/grades/course/${courseId}/distribution`);
        toast.info(`Showing distribution for all groups`);
      }

      setDistribution(distributionResponse.data);
    } catch (err) {
      console.error('Error fetching distribution:', err);
      setError('Failed to load distribution data');
      toast.error('Failed to load distribution data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnrollment = async () => {
    try {
      if (isEnrolled) {
        // Unenroll from course
        await api.delete(`/users/courses/${courseId}`);
        setIsEnrolled(false);
        toast.success('Successfully unenrolled from course');
      } else {
        // Enroll in course
        await api.post(`/users/courses/${courseId}`);
        setIsEnrolled(true);
        toast.success('Successfully enrolled in course');
      }
    } catch (err) {
      console.error('Error updating enrollment:', err);
      toast.error(isEnrolled ? 'Failed to unenroll from course' : 'Failed to enroll in course');
    }
  };

  if (loading && !course) {
    return <div>Loading course data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <h1>{course.name}</h1>
        <p>{course.description}</p>
        {course.isPublic && <span className="public-badge">Public</span>}
      </div>

      <div className="distribution-section">
        <div className="distribution-controls">
          <select 
            className="form-control"
            value={selectedGroup || ''}
            onChange={(e) => handleGroupChange(e.target.value || null)}
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>

          <div className="form-check">
            <input
              type="checkbox"
              id="showNormalDistribution"
              className="form-check-input"
              checked={showNormalDistribution}
              onChange={() => setShowNormalDistribution(!showNormalDistribution)}
            />
            <label htmlFor="showNormalDistribution" className="form-check-label">
              Show Normal Distribution
            </label>
          </div>
        </div>

        {loading ? (
          <div>Loading distribution data...</div>
        ) : distribution ? (
          <GradeHistogram 
            data={distribution} 
            showNormalDistribution={showNormalDistribution} 
          />
        ) : (
          <div>No distribution data available</div>
        )}
      </div>

      {isAuthenticated && user && (
        <div className="user-actions">
          {/* Student can add/remove course from their profile */}
          {user.role === 'STUDENT' && (
            <div className="student-actions">
              <button 
                className={`btn ${isEnrolled ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleEnrollment}
              >
                {isEnrolled ? 'Unenroll from Course' : 'Enroll in Course'}
              </button>
            </div>
          )}

          {/* Admin can edit course details */}
          {user.role === 'ADMIN' && (
            <div className="admin-actions">
              {/* Add admin controls */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;