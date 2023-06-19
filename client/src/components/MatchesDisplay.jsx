import axios from 'axios';
import { useEffect, useState } from 'react';
import { useCookies } from "react-cookie";
import { BASE_URL } from '../helper';

export default function MatchesDisplay({ matches, setSelectedUser }) {
  const BASEURL = `${BASE_URL}` || 'http://localhost:8000';
  const [matchedProfiles, setMatchedProfiles] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(null);
  const matchedUserIds = matches?.map(({ user_id }) => user_id);

  const userId = cookies.UserId;

  const getMatches = async () => {
    try {
      const response = await axios.get(`${BASEURL}/users`, {
        params: { userIds: JSON.stringify(matchedUserIds) }  //json.stringify because it passing through array of matcheduserIds
      })
      setMatchedProfiles(response.data);
    } catch (error) {
      console.log("Error" + error);
    }
  };

  useEffect(() => {
    getMatches();
  }, [matches]);

  console.log(" these are matched profiles:", matchedProfiles);


  // filter func when both people match with each other then they can msg
  /*const filteredMatchedProfiles = matchedProfiles?.filter(
    (matchedProfile) =>
      matchedProfile.matches.filter((profile) => profile.user_id == userId)
        .length > 0
  );*/

  return (
    <div className="matchesDisplay">
      {matchedProfiles?.map((match) => (   // if matchprofiles exist then map each match on an index
        <div key={match.user_id} className="matchCard" onClick={() => setSelectedUser(match)}>
          <div className="img-container">
            <img src={`${BASEURL}/${match?.picture}`} alt={match?.child_name + " profile"} />
            <p className="chats-name">{match?.child_name}</p>
          </div>
        </div>
      ))}
    </div>
  );

}