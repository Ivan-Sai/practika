import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import GradeHistogram from '../components/GradeHistogram';
import { useAuth } from '../contexts/AuthContext';

interface CourseDetails {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isAcceptingGrades: boolean;
  totalGrades: number;
  gradeDistribution?: {
    distribution: Record<string, number>;
    mean: number;
    stdDev: number;
    totalGrades: number;
  };
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    if (user) {
      checkEnrollmentStatus();
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/courses/${courseId}`);
      
      if (!response.data.isPublic && (!user || !user.isAdmin)) {
        toast.error('This course is not publicly available');
        navigate('/');
        return;
      }
      
      setCourse(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch course details. The course may not exist or is not publicly available.');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${API_URL}/profile/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const userCourses = response.data;
      setEnrolled(userCourses.some((c: any) => c.id === courseId));
    } catch (err) {
      console.error('Failed to check enrollment status', err);
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      toast.info('Please log in to enroll in this course');
      navigate('/login');
      return;
    }
    
    try {
      if (enrolled) {
        await axios.delete(`${API_URL}/profile/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('You have unenrolled from this course');
        setEnrolled(false);
      } else {
        await axios.post(`${API_URL}/profile/courses/${courseId}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('You have enrolled in this course');
        setEnrolled(true);
      }
    } catch (err) {
      toast.error('Failed to update enrollment status');
    }
  };

  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }

  if (error || !course) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-primary mt-3"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <h1>{course.name}</h1>
        <div className="course-status-badges">
          {course.isAcceptingGrades ? (
            <span className="badge badge-success">Open for Grades</span>
          ) : (
            <span className="badge badge-danger">Closed for Grades</span>
          )}
          <span className="badge badge-primary">
            {course.totalGrades || 0} {(course.totalGrades || 0) === 1 ? 'Grade' : 'Grades'}
          </span>
        </div>
      </div>
      
      {user && (
        <div className="enrollment-actions">
          <button 
            onClick={handleEnrollment} 
            className={`btn ${enrolled ? 'btn-danger' : 'btn-success'}`}
          >
            {enrolled ? 'Unenroll' : 'Enroll'}
          </button>
        </div>
      )}
      
      {course.description && (
        <div className="course-description">
          <h2>Description</h2>
          <p>{course.description}</p>
        </div>
      )}
      
      <div className="grade-distribution-section">
        <h2>Grade Distribution</h2>
        {course.gradeDistribution ? (
          <GradeHistogram data={course.gradeDistribution} showNormalDistribution={true} />
        ) : (
          <p>No grade distribution data available for this course.</p>
        )}
      </div>
      
      <div className="course-info-section">
        <h2>Course Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Course ID:</strong> {course.id}
          </div>
          <div className="info-item">
            <strong>Status:</strong>{' '}
            {course.isAcceptingGrades 
              ? 'Open for new grades' 
              : 'Not accepting new grades'}
          </div>
          <div className="info-item">
            <strong>Visibility:</strong> {course.isPublic ? 'Public' : 'Private'}
          </div>
          <div className="info-item">
            <strong>Total Grades:</strong> {course.totalGrades || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
