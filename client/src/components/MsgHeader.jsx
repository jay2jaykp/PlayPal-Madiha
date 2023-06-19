import {useCookies } from 'react-cookie';
import { BASE_URL } from '../helper';

export default function MsgHeader ({user}) {

  const [ cookies, setCookie, removeCookie ] = useCookies(['user'])
  const BASEURL = `${BASE_URL}` || 'http://localhost:8000';
  const logout = () =>{
    removeCookie('UserId',cookies.UserId);
    removeCookie('AuthToken', cookies.AuthToken)
    //window.location.reload();
    //window.location.href = `${BASEURL}/` ;  // redirects to   http://localhost:8000/
    window.location.href = 'http://localhost:8001/';
  } 
  
  return (
      <div className="msgboxHeader">
        <div className="profileContainer">
            <div className="imgContainer"> 
                <img src={`${BASEURL}/${user.picture}`} alt={`Profile picture of ${user.child_name}`} />
            </div>
            <h3>{user.child_name}</h3>
        </div>
            <i className="logoutIcon" onClick={logout}>Logout [X]</i>
      </div>
    );
  }