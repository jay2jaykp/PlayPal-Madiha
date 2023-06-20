import { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BASE_URL } from '../helper';

const Playdate = ({ navigate }) => {
  const BASEURL = `${BASE_URL}` || 'http://localhost:8000';
  const [cookies] = useCookies(['user']);
  const [playdateData, setPlaydateData] = useState({
    user_id: cookies.UserId,
    date: '',
    child_name: '',
    time: '',
    location: ''
  });

  const submitPlaydate = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${BASEURL}/playdate`, playdateData);
      console.log("Here is the response:", response);
      const success = response.status === 200;
      if (success) {
        // Navigate to the success page or any other desired destination
        navigate('/terms');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handlePlaydateChange = (event) => {
    const { name, value } = event.target;

    setPlaydateData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="playdate">
      <h2>Create Playdate</h2>
      <form onSubmit={submitPlaydate}>
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

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Playdate;
/*import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from "./Nav";
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BASE_URL } from '../helper';

const PlaydateEvent = () => {
  const [cookies, setCookie, removeCookie] = useCookies(null);
  const [playdateData, setPlaydateData] = useState({
    user_id: cookies.UserId,
    date: '',
    child_name: '',
    time: '',
    location: ''
  });

  const navigate = useNavigate();
  const BASEURL = `${BASE_URL}` || 'http://localhost:8000';

  const submitHandler = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${BASEURL}/playdate`, {
        userId: playdateData.user_id,
        date: playdateData.date,
        child_name: playdateData.child_name,
        time: playdateData.time,
        location: playdateData.location
      });

      console.log("here is the response:", response);
      const success = response.status === 200;
      if (success) navigate('/terms');
    } catch (err) {
      console.log(err);
    }
  };

  const eventHandler = (event) => {
    const { name, value } = event.target;

    setPlaydateData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  console.log("here is playdate data:", playdateData);

  return (
    <div>
      <Nav setShowAuth={() => { }} showAuth={true} />
      <div className="playdate">
        <h2>schedule a date</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="child_name">Child Name</label>
          <input
            type="text"
            name="child_name"
            id="child_name"
            placeholder="Child Name"
            required={true}
            value={playdateData.child_name}
            onChange={eventHandler}
          />

          <label htmlFor="date">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            placeholder="Date"
            required={true}
            value={playdateData.date}
            onChange={eventHandler}
          />

          <label htmlFor="time">Time</label>
          <input
            type="time"
            name="time"
            id="time"
            placeholder="Time"
            required={true}
            value={playdateData.time}
            onChange={eventHandler}
          />

          <label htmlFor="location">Location</label>
          <input
            type="text"
            name="location"
            id="location"
            placeholder="Location"
            required={true}
            value={playdateData.location}
            onChange={eventHandler}
          />

          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
};

export default PlaydateEvent;*/