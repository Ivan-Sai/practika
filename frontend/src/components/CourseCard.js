import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <div className="card course-card" onClick={handleClick}>
      <h3>{course.name}</h3>
      <p>{course.description}</p>
      <div className="course-meta">
        <span>Group: {course.group?.name || 'N/A'}</span>
        {course.isPublic && <span className="public-badge">Public</span>}
      </div>
    </div>
  );
};

export default CourseCard;