import React, { useState, useEffect } from 'react';
import { retrieve } from "./Encryption";

const ViewSurveyDetails = () => {
  const [surveyDetails, setSurveyDetails] = useState([]);

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

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Survey Details</h2>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Questions</th>
            <th>Survey Owner ID</th>
          </tr>
        </thead>
        <tbody>
          {surveyDetails.map(survey => (
            <tr key={survey.id}>
              <td>{survey.id}</td>
              <td>{survey.title}</td>
              <td>{JSON.stringify(survey.questions)}</td>
              <td>{survey.survey_owner_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewSurveyDetails;
