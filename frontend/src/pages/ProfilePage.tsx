import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import './ProfilePage.css';

interface Course {
  id: string;
  name: string;
  isPublic: boolean;
  isAcceptingGrades: boolean;
}

interface Group {
  id: string;
  name: string;
}

interface UserGrade {
  id: string;
  courseId: string;
  courseName: string;
  groupId: string;
  groupName: string;
  grade: number;
  isAcceptingGrades: boolean;
  isPublic: boolean;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [userGrades, setUserGrades] = useState<UserGrade[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states for adding new grade
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  
  // Form states for editing grade
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState('');
  const [editingGradeValue, setEditingGradeValue] = useState('');

  useEffect(() => {
    fetchUserGrades();
    fetchAvailableCourses();
    fetchAvailableGroups();
  }, []);

  const fetchUserGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/grades/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserGrades(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your grades. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      setAvailableCourses(response.data);
    } catch (err) {
      toast.error('Failed to fetch available courses');
    }
  };

  const fetchAvailableGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups`);
      setAvailableGroups(response.data);
    } catch (err) {
      toast.error('Failed to fetch available groups');
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourseId || !selectedGroupId || !gradeValue) {
      toast.error('Please complete all fields');
      return;
    }
    
    const gradeNum = parseInt(gradeValue, 10);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      toast.error('Grade must be a number between 0 and 100');
      return;
    }
    
    try {
      setIsAddingGrade(true);
      await axios.post(
        `${API_URL}/grades`,
        {
          courseId: selectedCourseId,
          groupId: selectedGroupId,
          grade: gradeNum
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('Grade added successfully');
      // Reset form
      setSelectedCourseId('');
      setSelectedGroupId('');
      setGradeValue('');
      // Refresh grades
      fetchUserGrades();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add grade');
    } finally {
      setIsAddingGrade(false);
    }
  };

  const handleEditGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingGradeId || !editingGroupId || !editingGradeValue) {
      toast.error('Please complete all fields');
      return;
    }
    
    const gradeNum = parseInt(editingGradeValue, 10);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      toast.error('Grade must be a number between 0 and 100');
      return;
    }
    
    try {
      await axios.patch(
        `${API_URL}/grades/${editingGradeId}`,
        {
          groupId: editingGroupId,
          grade: gradeNum
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('Grade updated successfully');
      // Reset editing state
      cancelEdit();
      // Refresh grades
      fetchUserGrades();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update grade');
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (!window.confirm('Are you sure you want to delete this grade?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/grades/${gradeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast.success('Grade deleted successfully');
      // Refresh grades
      fetchUserGrades();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete grade');
    }
  };

  const startEdit = (grade: UserGrade) => {
    setEditingGradeId(grade.id);
    setEditingGroupId(grade.groupId);
    setEditingGradeValue(grade.grade.toString());
  };

  const cancelEdit = () => {
    setEditingGradeId(null);
    setEditingGroupId('');
    setEditingGradeValue('');
  };

  if (loading) {
    return <div className="loading">Loading your profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      
      <div className="profile-info card">
        <div className="profile-header">
          <h2>{user?.username}</h2>
          <span className="profile-email">{user?.email}</span>
        </div>
      </div>
      
      <div className="profile-grades">
        <h2>My Grades</h2>
        
        {userGrades.length === 0 ? (
          <p className="no-grades">You haven't added any grades yet.</p>
        ) : (
          <div className="grades-table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Group</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userGrades.map(grade => (
                  <tr key={grade.id}>
                    <td>
                      {grade.isPublic ? (
                        <Link to={`/course/${grade.courseId}`} className="course-link">
                          {grade.courseName}
                        </Link>
                      ) : (
                        grade.courseName
                      )}
                    </td>
                    <td>
                      {editingGradeId === grade.id ? (
                        <select
                          value={editingGroupId}
                          onChange={(e) => setEditingGroupId(e.target.value)}
                          className="form-control"
                        >
                          {availableGroups.map(group => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        grade.groupName
                      )}
                    </td>
                    <td>
                      {editingGradeId === grade.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editingGradeValue}
                          onChange={(e) => setEditingGradeValue(e.target.value)}
                          className="form-control"
                        />
                      ) : (
                        grade.grade
                      )}
                    </td>
                    <td>
                      {grade.isAcceptingGrades ? (
                        <span className="badge badge-success">Open</span>
                      ) : (
                        <span className="badge badge-danger">Closed</span>
                      )}
                    </td>
                    <td>
                      {editingGradeId === grade.id ? (
                        <div className="action-buttons">
                          <button
                            onClick={handleEditGrade}
                            className="btn btn-primary btn-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="btn btn-light btn-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          {grade.isAcceptingGrades && (
                            <button
                              onClick={() => startEdit(grade)}
                              className="btn btn-secondary btn-sm"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteGrade(grade.id)}
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
      
      <div className="add-grade-section card">
        <h3>Add New Grade</h3>
        <form onSubmit={handleAddGrade} className="add-grade-form">
          <div className="form-group">
            <label htmlFor="courseId">Course</label>
            <select
              id="courseId"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select a course</option>
              {availableCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="groupId">Group</label>
            <select
              id="groupId"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select a group</option>
              {availableGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="grade">Grade (0-100)</label>
            <input
              type="number"
              id="grade"
              min="0"
              max="100"
              value={gradeValue}
              onChange={(e) => setGradeValue(e.target.value)}
              className="form-control"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isAddingGrade}
          >
            {isAddingGrade ? 'Adding...' : 'Add Grade'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
