import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve } from './Encryption'; // Ensure this path is correct

const ViewSingleSurveyDetails = () => {
  const { id } = useParams();
  const [surveyDetail, setSurveyDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch survey details from the backend
    fetch(`/surveys/${id}`, {
      headers: {
        Authorization: `Bearer ${retrieve().access_token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);  // Log the data to see its structure
        setSurveyDetail(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='content-wrapper' style={{ marginLeft: '280px', backgroundColor: 'white', marginTop: '20px' }}>
      <h2 style={{ marginLeft: '500px', marginBottom: '50px' }}>Survey Details</h2>
      <div>
        <h3>{surveyDetail?.survey?.title || 'Survey title not available'}</h3>
        <div>
          <h4>Questions:</h4>
          {surveyDetail?.survey?.questions ? (
            <ul>
              {surveyDetail.survey.questions.map((item, index) => (
                <li key={index}>{item.question || 'No question text available'}</li>
              ))}
            </ul>
          ) : (
            <p>No questions available</p>
          )}
        </div>
        <div>
          <h4>Survey Owner:</h4>
          <p>{surveyDetail?.survey?.survey_owner_name || 'Survey owner not available'}</p>
        </div>
        <div>
          <h4>Responses:</h4>
          {surveyDetail?.responses?.length > 0 ? (
            <ul>
              {surveyDetail.responses.map((response, index) => (
                <li key={index}>
                  <strong>User:</strong> {response.user_name || 'Unknown'}
                  <br />
                  <strong>Responses:</strong>
                  <ul>
                    {Object.entries(response.responses).map(([question, answer], i) => (
                      <li key={i}>
                        <strong>{question}:</strong> {answer}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>No responses available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSingleSurveyDetails;
