import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    acceptingGrades: true
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCourseForGroups, setSelectedCourseForGroups] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchGroups();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      acceptingGrades: true
    });
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.patch(`/courses/${editingCourse.id}`, formData);
        toast.success('Course updated successfully');
      } else {
        await api.post('/courses', formData);
        toast.success('Course created successfully');
      }
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setFormData({
      name: course.name,
      description: course.description || '',
      isPublic: course.isPublic,
      acceptingGrades: course.acceptingGrades
    });
    setEditingCourse(course);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${id}`);
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };

  const handleManageGroups = async (course) => {
    try {
      const response = await api.get(`/courses/${course.id}`);
      setSelectedCourseForGroups(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    }
  };

  const handleAddGroup = async () => {
    if (!selectedGroup || !selectedCourseForGroups) return;
    
    try {
      await api.post(`/courses/${selectedCourseForGroups.id}/groups/${selectedGroup}`);
      toast.success('Group added to course');
      
      // Refresh course details
      const response = await api.get(`/courses/${selectedCourseForGroups.id}`);
      setSelectedCourseForGroups(response.data);
      
      setSelectedGroup('');
    } catch (error) {
      console.error('Error adding group to course:', error);
      toast.error('Failed to add group to course');
    }
  };

  const handleRemoveGroup = async (groupId) => {
    try {
      await api.delete(`/courses/${selectedCourseForGroups.id}/groups/${groupId}`);
      toast.success('Group removed from course');
      
      // Refresh course details
      const response = await api.get(`/courses/${selectedCourseForGroups.id}`);
      setSelectedCourseForGroups(response.data);
    } catch (error) {
      console.error('Error removing group from course:', error);
      toast.error('Failed to remove group from course');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="admin-form">
        <h2>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Course Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              className="form-check-input"
              checked={formData.isPublic}
              onChange={handleInputChange}
            />
            <label htmlFor="isPublic" className="form-check-label">Public Course</label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              id="acceptingGrades"
              name="acceptingGrades"
              className="form-check-input"
              checked={formData.acceptingGrades}
              onChange={handleInputChange}
            />
            <label htmlFor="acceptingGrades" className="form-check-label">Accepting Grades</label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingCourse ? 'Update Course' : 'Add Course'}
            </button>
            {editingCourse && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-list">
        <h2>Courses</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Public</th>
              <th>Accepting Grades</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td>{course.name}</td>
                <td>{course.description}</td>
                <td>{course.isPublic ? 'Yes' : 'No'}</td>
                <td>{course.acceptingGrades ? 'Yes' : 'No'}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary mr-1"
                    onClick={() => handleEdit(course)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger mr-1"
                    onClick={() => handleDelete(course.id)}
                  >
                    Delete
                  </button>
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => handleManageGroups(course)}
                  >
                    Manage Groups
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCourseForGroups && (
        <div className="manage-groups-modal">
          <div className="modal-content">
            <h3>Manage Groups for {selectedCourseForGroups.name}</h3>
            <div className="group-selector">
              <select
                className="form-control"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Select a group to add</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <button 
                className="btn btn-primary"
                onClick={handleAddGroup}
                disabled={!selectedGroup}
              >
                Add Group
              </button>
            </div>
            
            <h4>Current Groups</h4>
            {selectedCourseForGroups.groups && selectedCourseForGroups.groups.length > 0 ? (
              <ul className="group-list">
                {selectedCourseForGroups.groups.map(group => (
                  <li key={group.id}>
                    {group.name}
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveGroup(group.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No groups assigned to this course.</p>
            )}
            
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedCourseForGroups(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
