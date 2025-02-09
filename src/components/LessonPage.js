// src/components/LessonPage.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const LessonPage = () => {
  const { id } = useParams();
  const lessonId = parseInt(id, 10);

  // State for code editor only used in lesson 1
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Predefined expected HTML answer for "Hello World" lesson
  const expectedCode = `<!DOCTYPE html>
<html>
  <head>
    <title>Hello World</title>
  </head>
  <body>
    Hello World
  </body>
</html>`.trim();

  // Handler for running the code
  const handleRun = async () => {
    setLoading(true);
    const userCode = code.trim();
    let isCorrect = false;

    // Compare the submitted code with the expected answer
    if (userCode === expectedCode) {
      setResult('Correct! Your code matches the expected output.');
      isCorrect = true;
    } else {
      setResult('Incorrect. Please try again.');
    }

    // Save the submission to Firestore
    try {
      const currentUser = auth.currentUser;
      await addDoc(collection(firestore, 'submissions'), {
        userEmail: currentUser ? currentUser.email : 'anonymous',
        lessonId: id,
        code: userCode,
        isCorrect,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving submission: ", error);
    }
    setLoading(false);
  };

  // For lesson 1, display the code editor and run button
  if (lessonId === 1) {
    return (
      <div className="container mt-4">
        <h1>Lesson {id}: HTML Hello World</h1>
        <p>
          Write HTML code to display "Hello World" and press the run button below.
        </p>
        <textarea
          className="form-control mb-3"
          rows="10"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Type your HTML code here..."
        ></textarea>
        <button
          className="btn btn-primary"
          onClick={handleRun}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run'}
        </button>
        {result && (
          <div className="mt-3 alert alert-info">
            {result}
          </div>
        )}
      </div>
    );
  }

  // For other lessons, retain the original placeholder content
  return (
    <div className="container mt-4">
      <h1>Lesson {id}</h1>
      <p>This is a placeholder for lesson details.</p>
    </div>
  );
};

export default LessonPage;
