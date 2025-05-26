import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './ProfilePage.css';

interface Course {
  id: string;
  name: string;
  description?: string;
}

interface Grade {
  id: string;
  value: number;
  course?: {
    name: string;
  };
  group?: {
    name: string;
  };
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [coursesResponse, gradesResponse] = await Promise.all([
          api.get('/users/courses'),
          api.get('/grades/my')
        ]);
        setEnrolledCourses(coursesResponse.data);
        setGrades(gradesResponse.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleRemoveCourse = async (courseId: string) => {
    try {
      await api.delete(`/users/courses/${courseId}`);
      setEnrolledCourses(prev => prev.filter(course => course.id !== courseId));
      toast.success('Course removed successfully');
    } catch (err) {
      console.error('Error removing course:', err);
      toast.error('Failed to remove course');
    }
  };

  const handleRemoveGrade = async (gradeId: string) => {
    try {
      await api.delete(`/grades/${gradeId}`);
      setGrades(prev => prev.filter(grade => grade.id !== gradeId));
      toast.success('Grade removed successfully');
    } catch (err) {
      console.error('Error removing grade:', err);
      toast.error('Failed to remove grade');
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile data...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  return (
    <div className="profile-container">
      {/* Тут такий самий JSX як у версії без TypeScript */}
      {/* ... */}
    </div>
  );

  function getGradeClass(grade: number): string {
    if (grade >= 90) return 'excellent';
    if (grade >= 75) return 'good';
    if (grade >= 60) return 'average';
    return 'poor';
  }
};

export default ProfilePage;