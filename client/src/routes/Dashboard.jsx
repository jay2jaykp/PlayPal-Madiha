import TinderCard from 'react-tinder-card';
import MsgContainer from "../components/MsgContainer";
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../helper';
import { useNavigate } from 'react-router-dom';

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
   // const [swipedUsers, setSwipedUsers] = useState([]);
    const [showPlaydateForm, setShowPlaydateForm] = useState(false);
    const [showScheduledDates, setShowScheduledDates] = useState(true);
    const [scheduledDates, setScheduledDates] = useState([]);

    const [playdateData, setPlaydateData] = useState({
        user_id: cookies.UserId,
        date: '',
        child_name: '',
        time: '',
        location: ''
    });
    const navigate = useNavigate();
    /**************************************************** */
    const getUser = async () => {
        try {
            const response = await axios.get(`${BASEURL}/user`, { params: { userId: userId } });
            setUser(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    /**************************************************** */
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

    /**************************************************** */
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
    /**************************************************** */
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

    /**************************************************** */
    const submitPlaydate = async (event) => {
        console.log('Submit playdate form');
        event.preventDefault();

        try {
            console.log('Submit playdate form2');
            const response = await axios.post(`${BASEURL}/playdate`, playdateData);
            console.log("Here is the response:", response);
            const success = response.status === 200;
            if (success) {
                // Reset the form and hide it
                setPlaydateData({
                    user_id: cookies.UserId,
                    date: '',
                    child_name: '',
                    time: '',
                    location: ''
                });
                setShowPlaydateForm(false);

                console.log("Here is setShowPlaydateForm response:", showPlaydateForm);
                // Navigate to the success page or any other desired destination
                navigate('/dashboard');
            }
        } catch (err) {
            console.log(err);
        }
    };

    /****************************************************/

    const handleClick = () => {
        setShowPlaydateForm(false);
        setShowScheduledDates(true);
    };

    /**************************************************** */

    const handlePlaydateChange = (event) => {
        const { name, value } = event.target;

        setPlaydateData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    /**************************************************** */
    const getScheduledDates = async () => {
        try {
            const response = await axios.get(`${BASEURL}/scheduled-dates/${userId}`);
            setScheduledDates(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getUser();
        getScheduledDates();
    }, []);

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
                                                    ? `url(${BASEURL}/${matchedUser.picture.replace(/\\/g, '/')})`
                                                    : 'none',
                                            }}
                                            className="card"
                                        >
                                            <Link to={`/profiledata/${matchedUser.user_id}`}>
                                                <h3 className="matched-username">{matchedUser.child_name}</h3>
                                            </Link>
                                        </div>
                                    </TinderCard>
                                ))
                            ) : (
                                <div className="no-matches-msg">
                                    Sorry, no matches found!
                                </div>
                            )}
                            <div className="swipeInfo">
                                {lastDirection ? <p>you swiped {lastDirection}</p> : <p />}
                            </div>
                        </div>
                        <div className="create-playdate">
                            <div className="close" onClick={handleClick}  > [X] </div>
                            {showPlaydateForm ? (
                                <form onSubmit={submitPlaydate}>
                                    <h2>   Create Playdate</h2>
                                    <label htmlFor="date">Date:</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={playdateData.date}
                                        onChange={handlePlaydateChange}
                                        required
                                    />
                                    <label htmlFor="childName">Child's Name:</label>
                                    <input
                                        type="text"
                                        id="childName"
                                        name="child_name"
                                        value={playdateData.child_name}
                                        onChange={handlePlaydateChange}
                                        required
                                    />
                                    <label htmlFor="time">Time:</label>
                                    <input
                                        type="time"
                                        id="time"
                                        name="time"
                                        value={playdateData.time}
                                        onChange={handlePlaydateChange}
                                        required
                                    />

                                    <label htmlFor="location">Location:</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={playdateData.location}
                                        onChange={handlePlaydateChange}
                                        required
                                    />
                                    <button type="submit" onClick={() => {
                                        setShowScheduledDates(true);
                                    }}>Submit</button>
                                </form>
                            )
                                : (
                                    <button onClick={() => {
                                        setShowPlaydateForm(true);
                                        setShowScheduledDates(false);
                                    }}>Create Playdate</button>
                                )}
                        </div>
                        <div className="scheduled-dates">
                            <h3>Scheduled Dates</h3>
                            {showScheduledDates ? (
                                scheduledDates.length > 0 ? (
                                    <ul>
                                        {scheduledDates.map((date) => (
                                            <li key={date._id}>
                                               Date: {date.date} <br />
                                                Name: {date.child_name} <br />
                                                Time: {date.time} <br /> Location: {date.location}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No scheduled dates found.</p>
                                )
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;