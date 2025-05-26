import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../config';
import './AdminComponents.css';

interface Group {
  id: string;
  name: string;
}

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [groupName, setGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit states
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch groups. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_URL}/groups`,
        { name: groupName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('Group created successfully');
      // Reset form
      setGroupName('');
      // Refresh groups
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingGroupId || !editingGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await axios.patch(
        `${API_URL}/groups/${editingGroupId}`,
        { name: editingGroupName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('Group updated successfully');
      // Reset editing state
      cancelEdit();
      // Refresh groups
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group? This may affect existing grades.')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast.success('Group deleted successfully');
      // Refresh groups
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const startEdit = (group: Group) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  if (loading) {
    return <div className="loading">Loading groups...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-component">
      <h2>Group Management</h2>
      
      <div className="admin-form-container">
        <h3>Create New Group</h3>
        <form onSubmit={handleCreateGroup} className="admin-form">
          <div className="form-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="form-control"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
      
      <h3 className="mt-4">All Groups</h3>
      
      {groups.length === 0 ? (
        <p className="no-data">No groups found. Create your first group above.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.id}>
                  <td>
                    {editingGroupId === group.id ? (
                      <input
                        type="text"
                        value={editingGroupName}
                        onChange={(e) => setEditingGroupName(e.target.value)}
                        className="form-control"
                        disabled={isSubmitting}
                      />
                    ) : (
                      group.name
                    )}
                  </td>
                  <td>
                    {editingGroupId === group.id ? (
                      <div className="action-buttons">
                        <button
                          onClick={handleUpdateGroup}
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
                          onClick={() => startEdit(group)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
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

export default GroupManagement;
