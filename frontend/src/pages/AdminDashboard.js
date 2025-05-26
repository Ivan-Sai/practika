import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  
  // Form states
  const [newCourse, setNewCourse] = useState({ name: '', description: '', isPublic: false });
  const [newGroup, setNewGroup] = useState({ name: '', courseId: '' });
  const [newGrade, setNewGrade] = useState({ studentId: '', courseId: '', groupId: '', value: '' });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch all data in parallel
        const [coursesRes, groupsRes, usersRes] = await Promise.all([
          api.get('/courses'),
          api.get('/groups'),
          api.get('/users')
        ]);

        setCourses(coursesRes.data);
        setGroups(groupsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/courses', newCourse);
      setCourses([...courses, response.data]);
      setNewCourse({ name: '', description: '', isPublic: false });
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/groups', newGroup);
      setGroups([...groups, response.data]);
      setNewGroup({ name: '', courseId: '' });
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group');
    }
  };

  const handleCreateGrade = async (e) => {
    e.preventDefault();
    try {
      await api.post('/grades', {
        ...newGrade,
        value: parseFloat(newGrade.value)
      });
      setNewGrade({ studentId: '', courseId: '', groupId: '', value: '' });
    } catch (err) {
      console.error('Error creating grade:', err);
      setError('Failed to create grade');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await api.delete(`/groups/${groupId}`);
      setGroups(groups.filter(group => group.id !== groupId));
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Failed to delete group');
    }
  };

  const handleToggleCoursePublic = async (course) => {
    try {
      const updatedCourse = { ...course, isPublic: !course.isPublic };
      await api.patch(`/courses/${course.id}`, { isPublic: !course.isPublic });
      setCourses(courses.map(c => c.id === course.id ? updatedCourse : c));
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course');
    }
  };

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Courses
        </button>
        <button 
          className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Groups
        </button>
        <button 
          className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          Grades
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <div className="tab-content">
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="courses-tab">
            <div className="card">
              <h2>Create New Course</h2>
              <form onSubmit={handleCreateCourse}>
                <div className="form-group">
                  <label htmlFor="courseName">Course Name</label>
                  <input
                    type="text"
                    id="courseName"
                    className="form-control"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="courseDescription">Description</label>
                  <textarea
                    id="courseDescription"
                    className="form-control"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="isPublic"
                    className="form-check-input"
                    checked={newCourse.isPublic}
                    onChange={(e) => setNewCourse({...newCourse, isPublic: e.target.checked})}
                  />
                  <label htmlFor="isPublic" className="form-check-label">
                    Public Course
                  </label>
                </div>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </form>
            </div>

            <h2>Manage Courses</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Public</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>{course.name}</td>
                      <td>{course.description}</td>
                      <td>
                        <button 
                          className={`btn ${course.isPublic ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => handleToggleCoursePublic(course)}
                        >
                          {course.isPublic ? 'Public' : 'Private'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="groups-tab">
            <div className="card">
              <h2>Create New Group</h2>
              <form onSubmit={handleCreateGroup}>
                <div className="form-group">
                  <label htmlFor="groupName">Group Name</label>
                  <input
                    type="text"
                    id="groupName"
                    className="form-control"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="groupCourse">Course</label>
                  <select
                    id="groupCourse"
                    className="form-control"
                    value={newGroup.courseId}
                    onChange={(e) => setNewGroup({...newGroup, courseId: e.target.value})}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Create Group</button>
              </form>
            </div>

            <h2>Manage Groups</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => (
                    <tr key={group.id}>
                      <td>{group.name}</td>
                      <td>{courses.find(c => c.id === group.courseId)?.name || 'N/A'}</td>
                      <td>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div className="grades-tab">
            <div className="card">
              <h2>Add New Grade</h2>
              <form onSubmit={handleCreateGrade}>
                <div className="form-group">
                  <label htmlFor="gradeStudent">Student</label>
                  <select
                    id="gradeStudent"
                    className="form-control"
                    value={newGrade.studentId}
                    onChange={(e) => setNewGrade({...newGrade, studentId: e.target.value})}
                    required
                  >
                    <option value="">Select a student</option>
                    {users
                      .filter(user => user.role === 'STUDENT')
                      .map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.email})
                        </option>
                      ))
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="gradeCourse">Course</label>
                  <select
                    id="gradeCourse"
                    className="form-control"
                    value={newGrade.courseId}
                    onChange={(e) => setNewGrade({...newGrade, courseId: e.target.value})}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="gradeGroup">Group (Optional)</label>
                  <select
                    id="gradeGroup"
                    className="form-control"
                    value={newGrade.groupId}
                    onChange={(e) => setNewGrade({...newGrade, groupId: e.target.value})}
                  >
                    <option value="">No group</option>
                    {groups
                      .filter(group => group.courseId === newGrade.courseId)
                      .map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="gradeValue">Grade Value (0-100)</label>
                  <input
                    type="number"
                    id="gradeValue"
                    className="form-control"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newGrade.value}
                    onChange={(e) => setNewGrade({...newGrade, value: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Grade</button>
              </form>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <h2>Manage Users</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;