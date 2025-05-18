import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import CourseList from '../components/CourseList';
import GradeDistributionChart from '../components/GradeDistributionChart';
import './HomePage.css';

interface OverallStats {
  totalCourses: number;
  totalGrades: number;
  overallDistribution: {
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
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverallStats();
  }, []);

  const fetchOverallStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/courses/stats`);
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch overall statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Grade Distribution Visualization</h1>
        <p>Explore course grade distributions across different groups</p>
      </section>

      {loading ? (
        <div className="loading">Loading statistics...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : stats ? (
        <section className="overall-stats">
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Courses</h3>
              <p className="stat-number">{stats.totalCourses}</p>
            </div>
            <div className="stat-card">
              <h3>Total Grades</h3>
              <p className="stat-number">{stats.totalGrades}</p>
            </div>
            <div className="stat-card">
              <h3>Average Grade</h3>
              <p className="stat-number">
                {stats.overallDistribution[0]?.mean.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="overall-distribution">
            <h2>Overall Grade Distribution</h2>
            <GradeDistributionChart distributions={stats.overallDistribution} />
          </div>
        </section>
      ) : null}

      <CourseList />
    </div>
  );
};

export default HomePage;
