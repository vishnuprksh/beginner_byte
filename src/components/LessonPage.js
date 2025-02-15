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
    const [suggestions, setSuggestions] = useState([]);

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

    const handleRun = async () => {
        setLoading(true);
        const userCode = code.trim();
        let isCorrect = false;

        try {
            // Call the Cloud Function
            const response = await fetch(
                'https://us-central1-beginnerbyte.cloudfunctions.net/getCodeSuggestions', // Replace with your actual function URL
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userCode: userCode, originalCode: expectedCode }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.text(); // Get plain text response
            setSuggestions([]); // Reset suggestions

            if (data.trim() === "Congratulations!") {
                setResult('Congratulations! Your code matches the expected output.');
                isCorrect = true;
            } else {
                setResult('Incorrect. Please try again.');
                // Split suggestions by lines and set them
                setSuggestions(data.trim().split('\n'));
            }


        } catch (error) {
            console.error("Error calling OpenAI API:", error);
            setResult(`Error: ${error.message}`);
            setSuggestions([]); // Clear suggestions in case of error
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

    // For lesson 1, display the code editor, run button, and suggestions
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
                {suggestions.length > 0 && (
                    <div className="mt-3">
                        <h4>Suggestions:</h4>
                        <ul>
                            {suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
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