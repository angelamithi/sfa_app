import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from './Encryption'; // Assuming you have a retrieve function for getting tokens

const ManageSurveys = () => {
  const [surveysDetails, setSurveysDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/surveys', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSurveysDetails(data);
        } else {
          setSurveysDetails([]);
          console.error('Error: data is not an array', data);
        }
      })
      .catch(error => {
        setSurveysDetails([]);
        console.error('Error fetching surveys:', error);
      });
  }, []);

  const handleRowClick = (id) => {
    navigate(`/survey/${id}`);
  };

  const handleEditClick = (id) => {
    navigate(`/edit_survey/${id}`);
  };

  const handleCreateSurveyClick = () => {
    navigate('/add_survey');
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      fetch(`/surveys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      })
        .then(response => {
          if (response.ok) {
            setSurveysDetails(prevDetails => prevDetails.filter(survey => survey.id !== id));
          } else {
            console.error('Failed to delete survey');
          }
        })
        .catch(error => {
          console.error('Error deleting survey:', error);
        });
    }
  };

  const formatDate = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(); // Format to 'MM/DD/YYYY' or adjust as needed
    }
    return '';
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Manage Surveys</h2>
        <button onClick={handleCreateSurveyClick}>Create Survey</button>
      </div>
      {surveysDetails.length === 0 ? (
        <p>No surveys found.</p>
      ) : (
        <table className='ui striped table' style={{ width: "100%", marginLeft: "60px", marginBottom: "20px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Owner</th>
              <th>Start Date</th>
              <th>Stop Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {surveysDetails.map(survey => (
              <tr key={survey.id} style={{ cursor: 'pointer' }}>
                <td onClick={() => handleRowClick(survey.id)}>{survey.id}</td>
                <td onClick={() => handleRowClick(survey.id)}>{survey.title}</td>
                <td onClick={() => handleRowClick(survey.id)}>{survey.owner_name || 'No Owner'}</td>
                <td onClick={() => handleRowClick(survey.id)}>{formatDate(survey.survey_start_date)}</td>
                <td onClick={() => handleRowClick(survey.id)}>{formatDate(survey.survey_stop_date)}</td>
                <td>
                  <button onClick={() => handleEditClick(survey.id)}>Edit</button>
                  <button onClick={() => handleDeleteClick(survey.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageSurveys;
