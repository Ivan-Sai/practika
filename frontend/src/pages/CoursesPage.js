import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { toast } from 'react-toastify';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let endpoint = '/courses/all';
        if (!isAuthenticated) {
          endpoint = '/courses/public';
        }
        
        const response = await api.get(endpoint);
        setCourses(response.data);
        toast.info(`Loaded ${response.data.length} courses`);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [isAuthenticated]);

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="courses-page">
      <h1>Courses</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search courses..."
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <div className="course-list">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;