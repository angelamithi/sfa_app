import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption'; // Assumed method for retrieving access token
import { useNavigate } from 'react-router-dom';

const AddSurvey = () => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState(['']); // Start with one empty question
  const [surveyStartDate, setSurveyStartDate] = useState('');
  const [surveyStopDate, setSurveyStopDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Handle changes in question input
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const newSurvey = {
      title,
      questions: questions.reduce((acc, question, index) => {
        acc[`Question ${index + 1}`] = question;
        return acc;
      }, {}),
      survey_start_date: surveyStartDate,
      survey_stop_date: surveyStopDate,
      survey_owner_id: retrieve().user_id // Assuming you have a user_id stored in the token
    };

    fetch('/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(newSurvey),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then((err) => {
            setError(err.error || 'Failed to create survey. Please try again.');
            setMessage('');
            throw new Error(err.error || 'Failed to create survey. Please try again.');
          });
        }
        return resp.json();
      })
      .then((data) => {
        console.log('New Survey Created:', data);
        setMessage('Survey has been created successfully!');
        setTimeout(() => {
          navigate('/manage_surveys');
        }, 3000);
      })
      .catch((error) => {
        console.error('Error creating survey:', error);
        setError('Failed to create survey. Please try again.');
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  return (
    <div
      className='content-wrapper'
      style={{ marginLeft: '280px', backgroundColor: 'white', marginTop: '20px' }}
    >
      <h2>Create New Survey</h2>
      {error && <div className='error-message'>{error}</div>}
      {message && <div className='success-message'>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='title'>Survey Title</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={handleInputChange(setTitle)}
            required
          />
        </div>
        <div className='form-group'>
          <label>Questions</label>
          {questions.map((question, index) => (
            <div key={index} className='question-field'>
              <input
                type='text'
                value={question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                required
              />
              <button type='button' onClick={() => removeQuestion(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type='button' onClick={addQuestion}>
            Add Question
          </button>
        </div>
        <div className='form-group'>
          <label htmlFor='surveyStartDate'>Survey Start Date</label>
          <input
            type='date'
            id='surveyStartDate'
            value={surveyStartDate}
            onChange={handleInputChange(setSurveyStartDate)}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='surveyStopDate'>Survey Stop Date</label>
          <input
            type='date'
            id='surveyStopDate'
            value={surveyStopDate}
            onChange={handleInputChange(setSurveyStopDate)}
            required
          />
        </div>
        <button type='submit'>Create Survey</button>
      </form>
    </div>
  );
};

export default AddSurvey;
