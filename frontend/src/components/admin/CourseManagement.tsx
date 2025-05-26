import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../config';
import './AdminComponents.css';

interface Course {
  id: string;
  name: string;
  isPublic: boolean;
  isAcceptingGrades: boolean;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [courseName, setCourseName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isAcceptingGrades, setIsAcceptingGrades] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit states
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseName, setEditingCourseName] = useState('');
  const [editingIsPublic, setEditingIsPublic] = useState(false);
  const [editingIsAcceptingGrades, setEditingIsAcceptingGrades] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/courses/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseName.trim()) {
      toast.error('Course name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_URL}/courses`,
        {
          name: courseName,
          isPublic,
          isAcceptingGrades
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('Course created successfully');
      // Reset form
      setCourseName('');
      setIsPublic(false);
      setIsAcceptingGrades(true);
      // Refresh courses
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCourseId || !editingCourseName.trim()) {
      toast.error('Course name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await axios.patch(
        `${API_URL}/courses/${editingCourseId}`,
        {
          name: editingCourseName,
          isPublic: editingIsPublic,
          isAcceptingGrades: editingIsAcceptingGrades
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('Course updated successfully');
      // Reset editing state
      cancelEdit();
      // Refresh courses
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This will also delete all associated grades.')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast.success('Course deleted successfully');
      // Refresh courses
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const startEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setEditingCourseName(course.name);
    setEditingIsPublic(course.isPublic);
    setEditingIsAcceptingGrades(course.isAcceptingGrades);
  };

  const cancelEdit = () => {
    setEditingCourseId(null);
    setEditingCourseName('');
    setEditingIsPublic(false);
    setEditingIsAcceptingGrades(true);
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-component">
      <h2>Course Management</h2>
      
      <div className="admin-form-container">
        <h3>Create New Course</h3>
        <form onSubmit={handleCreateCourse} className="admin-form">
          <div className="form-group">
            <label htmlFor="courseName">Course Name</label>
            <input
              type="text"
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="form-control"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={isSubmitting}
              />
              Public Course (visible to all users)
            </label>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isAcceptingGrades}
                onChange={(e) => setIsAcceptingGrades(e.target.checked)}
                disabled={isSubmitting}
              />
              Accepting Grades (students can submit grades)
            </label>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>
      
      <h3 className="mt-4">All Courses</h3>
      
      {courses.length === 0 ? (
        <p className="no-data">No courses found. Create your first course above.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Public</th>
                <th>Accepting Grades</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>
                    {editingCourseId === course.id ? (
                      <input
                        type="text"
                        value={editingCourseName}
                        onChange={(e) => setEditingCourseName(e.target.value)}
                        className="form-control"
                        disabled={isSubmitting}
                      />
                    ) : (
                      course.name
                    )}
                  </td>
                  <td>
                    {editingCourseId === course.id ? (
                      <input
                        type="checkbox"
                        checked={editingIsPublic}
                        onChange={(e) => setEditingIsPublic(e.target.checked)}
                        disabled={isSubmitting}
                      />
                    ) : (
                      <span className={`badge ${course.isPublic ? 'badge-success' : 'badge-danger'}`}>
                        {course.isPublic ? 'Yes' : 'No'}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingCourseId === course.id ? (
                      <input
                        type="checkbox"
                        checked={editingIsAcceptingGrades}
                        onChange={(e) => setEditingIsAcceptingGrades(e.target.checked)}
                        disabled={isSubmitting}
                      />
                    ) : (
                      <span className={`badge ${course.isAcceptingGrades ? 'badge-success' : 'badge-danger'}`}>
                        {course.isAcceptingGrades ? 'Yes' : 'No'}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingCourseId === course.id ? (
                      <div className="action-buttons">
                        <button
                          onClick={handleUpdateCourse}
                          className="btn btn-primary btn-sm"
                          disabled={isSubmitting}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn btn-light btn-sm"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          onClick={() => startEdit(course)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
