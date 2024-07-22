import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from "./Encryption";

const ViewSurveyDetails = () => {
  const [surveyDetails, setSurveyDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/surveys', {
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        const surveys = data.map(survey => ({ ...survey, type: 'Survey' }));
        setSurveyDetails(surveys);
      })
      .catch(error => {
        console.error('Error fetching surveys:', error);
      });
  }, []);

  // Handler for row click
  const handleRowClick = (id) => {
    navigate(`/surveys/${id}`); // Navigate to survey details page
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Survey Details</h2>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Owner Name</th> {/* Updated header */}
            <th>Start Date</th> {/* New header */}
            <th>Stop Date</th> {/* New header */}
          </tr>
        </thead>
        <tbody>
          {surveyDetails.map(survey => (
            <tr key={survey.id} onClick={() => handleRowClick(survey.id)} style={{ cursor: 'pointer' }}>
              <td>{survey.id}</td>
              <td>{survey.title}</td>
              <td>{survey.owner_name}</td> {/* Display owner name */}
              <td>{survey.survey_start_date}</td> {/* Display start date */}
              <td>{survey.survey_stop_date}</td> {/* Display stop date */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewSurveyDetails;
