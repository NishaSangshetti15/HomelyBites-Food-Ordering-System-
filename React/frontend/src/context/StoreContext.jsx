import { createContext, useEffect, useState } from "react";
import { food_list } from "../assets/assets";
export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const[cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000"
    const [token, setToken] = useState('')
    const [customer, setCustomer] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const addToCart = (itemId) => {
        if(!cartItems[itemId]){
            setCartItems((prev)=>({...prev,[itemId]:1}))
        }
        else{
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for(const item in cartItems){
            if (cartItems[item] > 0){
                let itemInfo = food_list.find((product)=>product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }  
        }
        return totalAmount;
    }

    useEffect(()=>{
        const storedToken = localStorage.getItem("token");
        const storedRole = localStorage.getItem("userRole");
        
        if (storedToken) {
            setToken(storedToken);
            setUserRole(storedRole);
            setIsAuthenticated(true);
            
            // Fetch customer profile
            fetch('http://localhost:4000/customer/dashboard/settings', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.data) {
                    setCustomer(data.data);
                }
            })
            .catch(err => console.error('Error fetching customer profile:', err))
        }
    },[])

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        customer,
        setCustomer,
        userRole,
        setUserRole,
        isAuthenticated,
        setIsAuthenticated
    }


    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}


export default StoreContextProvider;