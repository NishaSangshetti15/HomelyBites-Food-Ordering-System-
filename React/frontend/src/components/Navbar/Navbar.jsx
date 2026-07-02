import React, { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
const Navbar = ({setShowLogin}) => {
    
    const [menu, setMenu] = useState("home");

    const {getTotalCartAmount, token, setToken, setUserRole, setIsAuthenticated} = useContext(StoreContext)

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setToken("")
        setUserRole(null)
        setIsAuthenticated(false)
        navigate('/auth')
    }

  return (
    <div className='navbar'>
        <Link to='/'><img src= {assets.homelybite} alt='' className='logo'/></Link>
        <ul className='navbar-menu'>
            <Link to='/customer/dashboard' onClick={() => setMenu("home")} className={menu==="home"?"active":""}>Dashboard</Link>
            <Link to='/browse' onClick={() => setMenu("menu")} className={menu==="menu"?"active":""}>Browse Food</Link>
            <a href='#app-download' onClick={() => setMenu("mobile-app")} className={menu==="mobile-app"?"active ":""}>mobile-app</a>
            <a href='#footer' onClick={() => setMenu("contact-us")} className={menu==="contact-us"?"active ":""}>contact us</a>
        </ul>
        <div className='navbar-right'>
            <img src={assets.search_icon} alt=''/>
            <div className='navbar-search_icon'>
                <Link to='/cart'><img src={assets.basket_icon} alt=''/></Link>
                <div className={getTotalCartAmount()===0?"":"dot"}></div>
            </div>
            {!token? <button onClick={()=>setShowLogin(true)}>sign in</button>
            :<div className='navbar-profile'>
                <img src={assets.profile_icon} alt=''/>
                <ul className='nav-profilr-dropdown'>
                    <Link to='/customer/dashboard'><li><img src={assets.bag_icon} alt=''/>Dashboard</li></Link>
                    <hr/>
                    <li onClick={logout}><img src={assets.logout_icon} alt=''/>Logout</li>
                </ul>
            </div>}
            
        </div>
    </div>
  )
}

export default Navbar
