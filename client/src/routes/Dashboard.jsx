import TinderCard from 'react-tinder-card';
import MsgContainer from "../components/MsgContainer";
//import '@react-spring/web';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../helper';

const Dashboard = () => {
    const BASEURL = `${BASE_URL}` || 'http://localhost:8000';
    const [cookies, setCookie, removeCookie] = useCookies(['user']);
    const userId = cookies.UserId;
    const [user, setUser] = useState({
        user_id: cookies.UserId,
        picture: '',
        child_name: '',
        age: '',
        gender: '',
        city: '',
        country: '',
        language: '',
        other_language: '',
        show_matches: '',
        interest: [],
        availability: [],
        additional_info: '',
        matches: []
    });
    const [matchedUsers, setMatchedUsers] = useState(null);
    const [lastDirection, setLastDirection] = useState();
    const [swipedUsers, setSwipedUsers] = useState([]);
    const [playdate, setPlaydate] = useState(null);
    /*
        const getUser = async () => {
            try {
              const response = await axios.get(`${BASEURL}/user`, { params: { userId: userId } });
              const userData = response.data;
              const isAdmin = userData.email === 'admin@gmail.com'; // Assuming admin email is 'admin@example.com'
              setUser({ ...userData, isAdmin });
            } catch (error) {
              console.log(error);
            }
          };
          
        */
    const getUser = async () => {
        try {
            const response = await axios.get(`${BASEURL}/user`, { params: { userId: userId } });
            setUser(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getMatchedUsers = async () => {
        try {
            const response = await axios.get(`${BASEURL}/matched-users`, {
                params: { city: user?.show_matches }
            });
            setMatchedUsers(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        if (user) {
            getMatchedUsers();
        }
    }, [user]);

    const updateMatches = async (matchedUserId) => {
        try {
            await axios.put(`${BASEURL}/addmatch`, {
                userId,
                matchedUserId
            });
            getUser();
        } catch (err) {
            console.log("Error", err);
        }
    };

    const createPlaydate = async (matchedUserId) => {
        try {
            const response = await axios.post(`${BASEURL}/create-playdate`, {
                userId,
                matchedUserId
            });
            setPlaydate(response.data);
        } catch (err) {
            console.log("Error", err);
        }
    };
    console.log("this is playdate: ", playdate);

    const swiped = (direction, swipedUserId) => {
        if (direction === 'right' || direction === 'up') {
            updateMatches(swipedUserId);
        }
        setLastDirection(direction);
    };

    const outOfFrame = (childName) => {
        console.log(childName + " left the screen");
    };

    const matchedUserIds = user?.matches?.map(({ user_id }) => user_id).concat(userId) || [];
    const filteredCityUsers = matchedUsers?.filter(matchedUser => !matchedUserIds.includes(matchedUser.user_id));

    return (
        <div>
            {user && (
                <div className="dashboard">
                    <MsgContainer user={user} />
                    <div className="movetoNext">
                        <div className="cardContanier">
                        <h3 className="cardContanier-heading">Matches</h3>
                        <p className="cardContanier-subheading">(Swipe Right to Chat, Left to Pass)</p>
                            {filteredCityUsers && filteredCityUsers.length > 0 ? (
                                
                                filteredCityUsers.map((matchedUser) => (
                                    
                                    <TinderCard
                                        className="swipe"
                                        key={matchedUser.user_id}
                                        onSwipe={(dir) => swiped(dir, matchedUser.user_id)}
                                        onCardLeftScreen={() => outOfFrame(matchedUser.child_name)}
                                    >
                                        <div
                                            style={{
                                                backgroundImage: matchedUser.picture
                                                    ? `url(${matchedUser.picture.replace(/\\/g, '/')})`
                                                    : 'none',
                                            }}
                                            className="card"
                                        >
                                            <Link to={`/profiledata/${matchedUser.user_id}`}>
                                                <h3 className="matched-username" >{matchedUser.child_name}</h3>
                                            </Link>
                                            <button onClick={() => createPlaydate(matchedUser.user_id)}>Create Playdate</button>
                                            {playdate && (
                                                <div>
                                                    Playdate: {playdate.date} , User:{playdate.matchedUserId}
                                                </div>
                                            )}
                                        </div>
                                    </TinderCard>
                                    
                                ))
                            ) : (
                                <div className="no-matches-msg">
                                    Sorry, no matches at this time!
                                </div>
                            )}
                            <div className="swipeInfo">
                                {lastDirection ? <p>you swiped {lastDirection}</p> : <p />}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;