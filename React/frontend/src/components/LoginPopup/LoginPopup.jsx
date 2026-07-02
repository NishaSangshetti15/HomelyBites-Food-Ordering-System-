import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from'axios'
import { useNavigate } from 'react-router-dom'

const LoginPopup = ({setShowLogin}) => {

    const navigate = useNavigate()
    const {url, setToken} = useContext(StoreContext)

    const [currState, setCurrState] = useState("Login")
    const [data, setData] = useState({
        first_name:"",
        last_name:"",
        email:"",
        password_hash:"",
        phone_number:""
    })

    const onChangeHandler = (event) => {
        const name= event.target.name
        const value = event.target.value
        setData(data=>({...data,[name] : value}))
    }

    const onLogin = async (event) => {
        event.preventDefault();

        let newUrl = url;
        let payload = {
            email: data.email,
            password: data.password_hash
        };


        if (currState === "Login") {
            newUrl += "/customer/signin";
            payload = {
            email: data.email,
            password_hash: data.password_hash
            };
        } else {
            newUrl += "/customer/signup";
            payload = data;
        }

        try {
            const response = await axios.post(newUrl, payload);
            console.log("API RESPONSE:", response.data);

            if (response.data.status === "success") {
            // assuming token is inside data
            const token = response.data.data.token;

            setToken(token);
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", "Customer");
            setShowLogin(false);
            } else {
            alert("Invalid credentials");
            }

        } catch (error) {
            console.error(error);
            alert("Server error. Please try again.");
        }
    };

    const openUnifiedAuth = () => {
        setShowLogin(false);
        navigate('/auth');
    }



  return (
    <div className='login-popup'>
        <form  onSubmit={onLogin} className="login-popup-container">
            <div className="login-popup-title">
                <h2>{currState}</h2>
                <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt=''/>
            </div>
            <div className="login-popup-inputs">

            {currState !== "Login" && (
                <>
                <input
                    name="first_name"
                    value={data.first_name}
                    onChange={onChangeHandler}
                    type="text"
                    placeholder="Enter Your First Name"
                    required
                />

                <input
                    name="last_name"
                    value={data.last_name}
                    onChange={onChangeHandler}
                    type="text"
                    placeholder="Enter Your Last Name"
                    required
                />
                </>
            )}

            <input
                name="email"
                value={data.email}
                onChange={onChangeHandler}
                type="email"
                placeholder="Enter Your Email"
                required
            />

            <input
                name="password_hash"
                value={data.password_hash}
                onChange={onChangeHandler}
                type="password"
                placeholder="Enter Your Password"
                required
            />

                        {currState !== "Login" && (
                            <input
                            name="phone_number"
                            value={data.phone_number}
                            onChange={onChangeHandler}
                            type="tel"
                            placeholder="Enter Your Phone Number"
                            required
                            />
                        )}

            </div>

            <button type='submit'>{currState==="Sign up"?"Create account":"Login"}</button>
            <div className="login-popup-condition">
                 <input type='checkbox' required/>
                 <p>By continuing, i agree to the terms of use & privacy policy</p>
            </div>
            {currState==="Login"
            ?<p>Create a new account? <span onClick={()=>setCurrState("Sign up")}>Click here</span></p>
            :<p>Already have an account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>
            }
            <div className="unified-auth-link">
                <p>Register as Home Chef, Delivery Person or Admin? <span onClick={openUnifiedAuth}>Use unified login</span></p>
            </div>
        </form>
    </div>
  )
}

export default LoginPopup
