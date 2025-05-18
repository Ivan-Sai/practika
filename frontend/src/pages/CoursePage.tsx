import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import GradeDistributionChart from '../components/GradeDistributionChart';
import './CoursePage.css';

interface CourseDetails {
  id: string;
  name: string;
  isPublic: boolean;
  isAcceptingGrades: boolean;
  distributions?: {
    groupId: string;
    groupName: string;
    distribution: {
      min: number;
      max: number;
      label: string;
      count: number;
    }[];
    mean: number;
    variance: number;
  }[];
  totalGrades: number;
}

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/courses/${id}`);
      
      if (!response.data.isPublic) {
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
    <div className="course-page">
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
      
      <div className="course-content">
        <div className="card mb-4">
          <div className="card-header">
            <h2>Grade Distribution</h2>
          </div>
          <div className="card-body">
            {course.distributions && course.distributions.length > 0 ? (
              <GradeDistributionChart distributions={course.distributions} />
            ) : (
              <p className="no-data">No grade data available for this course yet.</p>
            )}
          </div>
        </div>
        
        <div className="card mb-4">
          <div className="card-header">
            <h2>Course Information</h2>
          </div>
          <div className="card-body">
            <p>
              <strong>Status:</strong>{' '}
              {course.isAcceptingGrades 
                ? 'This course is currently accepting grade submissions.' 
                : 'This course is not accepting new grade submissions.'}
            </p>
            <p>
              <strong>Visibility:</strong> Public
            </p>
            <p>
              <strong>Total Grades:</strong> {course.totalGrades}
            </p>
            {course.distributions && course.distributions.length > 0 && (
              <p>
                <strong>Overall Mean:</strong>{' '}
                {(course.distributions.reduce((sum, dist) => sum + (dist.mean || 0), 0) / course.distributions.length).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
