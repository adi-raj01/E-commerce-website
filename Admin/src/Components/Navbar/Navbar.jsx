import React from 'react'
import './Navbar.css'
import navlogo from '../../assets/Admin_Assets/nav-logo.svg';
import navProfile from '../../assets/Admin_Assets/nav-profile.svg';
function Navbar() {
  return (
    <div className='navbar'>
        <img src={navlogo} className='nav-logo'/>
        <img src={navProfile}  className='nav-profile'/>
    </div>
  )
}

export default Navbar