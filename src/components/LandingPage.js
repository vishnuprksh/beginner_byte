// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const lessons = [
  { id: 1, title: "Python Basics: Hello World", videoUrl: "https://via.placeholder.com/150", description: "Start your Python journey with the classic 'Hello, World!' program." },
  { id: 2, title: "Variables and Data Types in Python", videoUrl: "https://via.placeholder.com/150", description: "Learn about variables and basic data types in Python." },
  // Add more Python lessons as needed
];

const LandingPage = () => {
  return (
    <div className="container mt-4">
      <h1>BeginnerByte Python Lessons</h1> {/* MODIFIED: Changed heading */}
      <div className="row">
        {lessons.map((lesson) => (
          <div className="col-md-4" key={lesson.id}>
            <div className="card mb-4">
              <img src={lesson.videoUrl} className="card-img-top" alt={`${lesson.title} thumbnail`} />
              <div className="card-body">
                <h5 className="card-title">{lesson.title}</h5>
                <p className="card-text">{lesson.description}</p>
                <Link to={`/lesson/${lesson.id}`} className="btn btn-primary">
                  View Lesson
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;