import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from "./Encryption";

const ViewCommunityDetails = () => {
  const [communityDetails, setCommunityDetails] = useState([]);
  const navigate = useNavigate(); // Hook to navigate programmatically

  useEffect(() => {
    fetch('/communities', {
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        const communities = data.map(community => ({ ...community, type: 'Community' }));
        setCommunityDetails(communities);
      })
      .catch(error => {
        console.error('Error fetching communities:', error);
      });
  }, []);

  const handleRowClick = (id) => {
    navigate(`/community/${id}`); // Navigate to the community detail page
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Community Details</h2>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Coordinator ID</th>
            <th>Coordinator Name</th>
          </tr>
        </thead>
        <tbody>
          {communityDetails.map(community => (
            <tr key={community.id} onClick={() => handleRowClick(community.id)} style={{ cursor: 'pointer' }}>
              <td>{community.id}</td>
              <td>{community.name}</td>
              <td>{community.description}</td>
              <td>{community.coordinator_id}</td>
              <td>{community.coordinator_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewCommunityDetails;
