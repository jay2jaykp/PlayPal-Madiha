import './App.css'
import { BASE_URL } from './helper'; // Import BASE_URL from helper.jsx

// Import page content
import Home from "./routes/Home";
import Dashboard from "./routes/Dashboard";
import Profile from "./routes/Profile";
import ProfileData from "./routes/ProfileData";

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Terms from './routes/Terms';

function App() {
  const [cookies] = useCookies(['user']);
  const authToken = cookies.AuthToken;
  const BASEURL = BASE_URL || 'http://localhost:8000'; // Use BASE_URL from helper.jsx

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/profiledata/:userId" element={<ProfileData />} />
          {authToken && <Route path="/dashboard" element={<Dashboard BASEURL={BASEURL} />} />}
          {authToken && <Route path="/profile" element={<Profile BASEURL={BASEURL} />} />}
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
