import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../helper';
import { useParams } from 'react-router-dom';


const ProfileData = () => {
  const { userId } = useParams();
  const BASEURL = `${BASE_URL}` || 'http://localhost:8000';
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASEURL}/profiledata/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, [userId, BASEURL]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1>{user.child_name}</h1>
      <img src={`${BASEURL}/${user.picture}`} alt={`Profile picture of ${user.child_name}`} />
      <div className="profile-info">
        <label>Age:</label>
        <p>{user.age}</p>
        <label>Gender:</label>
        <p>{user.gender}</p>
        <label>City:</label>
        <p>{user.city}</p>
        <label>Country:</label>
        <p>{user.country}</p>
        <label>Language:</label>
        <p>{user.language}</p>
        <label>Other Language:</label>
        <p>{user.other_language}</p>
        <label>Show Matches:</label>
        <p>{user.show_matches}</p>
        <label>Interest:</label>
        <p>{user.interest}</p>
        <label>Availability:</label>
        <p>{user.availability}</p>
        <label>Additional Info:</label>
        <p>{user.additional_info}</p>
      </div> 
    </div>
  );
};

export default ProfileData;
