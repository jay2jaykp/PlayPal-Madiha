import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from "../components/Nav";
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BASE_URL } from '../helper';

const Playdate = () => {
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
      const response = await axios.put(`${BASEURL}/playdates`, playdateData);

      console.log("here is the response:", response);
      const success = response.status === 200;
      if (success) navigate('/playdate');
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

export default Playdate;
