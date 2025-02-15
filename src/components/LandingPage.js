// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const lessons = [
  { id: 1, title: "Introduction to Coding", videoUrl: "https://via.placeholder.com/150", description: "Learn the basics of coding." },
  { id: 2, title: "Building Your First Website", videoUrl: "https://via.placeholder.com/150", description: "Get started with HTML and CSS." },
  // Add more lessons as needed
];

const LandingPage = () => {
  return (
    <div className="container mt-4">
      <h1>BeginnerByte Lessons</h1>
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