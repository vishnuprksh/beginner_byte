// src/components/LessonPage.js
import React from 'react';
import { useParams } from 'react-router-dom';

const LessonPage = () => {
  const { id } = useParams();

  return (
    <div className="container mt-4">
      <h1>Lesson {id}</h1>
      <p>This is a placeholder for lesson details.</p>
    </div>
  );
};

export default LessonPage;
