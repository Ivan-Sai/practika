import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './CourseList.css';

interface Course {
  id: string;
  name: string;
  isPublic: boolean;
  isAcceptingGrades: boolean;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'default'>('default');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/courses/public`);
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses
    .filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="course-list">
      <div className="course-list-header">
        <h2>Available Courses</h2>
        <div className="course-list-filters">
          <input
            type="text"
            placeholder="Search by course name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'name' | 'default')}
            className="sort-select"
          >
            <option value="default">Sort by</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <p className="no-courses">No courses found matching "{searchTerm}"</p>
      ) : (
        <div className="course-grid">
          {filteredCourses.map(course => (
            <Link to={`/course/${course.id}`} key={course.id} className="course-card">
              <h3>{course.name}</h3>
              <div className="course-status">
                {course.isAcceptingGrades ? (
                  <span className="badge badge-success">Open for grades</span>
                ) : (
                  <span className="badge badge-danger">Closed for grades</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
