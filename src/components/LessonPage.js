// src/components/LessonPage.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const LessonPage = () => {
  const { id } = useParams();
  const lessonId = parseInt(id, 10);

  // State for the code editor (used in lesson 1)
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Expected HTML code for the "Hello World" lesson (lesson 1)
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

    // Replace the basic comparison with a call to the Firebase Function
    try {
      // Replace <YOUR_REGION> and <YOUR_PROJECT_ID> with your Firebase project details.
      // For example: https://us-central1-your-project-id.cloudfunctions.net/compareCode
      const functionUrl = "https://us-central1-beginnerbyte.cloudfunctions.net/compareCode";
      
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_code: userCode,
          original_code: expectedCode
        })
      });

      if (!response.ok) {
        throw new Error("Error in code comparison");
      }

      const data = await response.json();

      let displayResult = "";
      if (data.score === 3) {
        displayResult = "Correct! Congratulations! Your code matches the expected output.";
      } else {
        displayResult = `Score: ${data.score}. Suggestions: ${data.suggestions.join(" ")}`;
      }

      setResult(displayResult);

      // Save the submission to Firestore including the evaluation details
      const currentUser = auth.currentUser;
      await addDoc(collection(firestore, 'submissions'), {
        userEmail: currentUser ? currentUser.email : 'anonymous',
        lessonId: id,
        code: userCode,
        score: data.score,
        suggestions: data.suggestions,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error:", error);
      setResult("Error comparing code. Please try again later.");
    }
    setLoading(false);
  };

  // For lesson 1, display the code editor and run button with the new functionality
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
