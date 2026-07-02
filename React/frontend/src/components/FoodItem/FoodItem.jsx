import React, { useContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const FoodItem = ({ id, name, price, description, image }) => {

  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext)

  // ✅ ensure consistent key type
  const itemId = id.toString()

  return (
    <div className='food-item'>

      <div className='food-item-img-container'>
        <img className='food-item-image' src={image} alt={name} />

        {!cartItems[itemId] ? (
          <img
            className='add'
            src={assets.add_icon_white}
            alt='add'
            onClick={() => addToCart(itemId)}
          />
        ) : (
          <div className='food-item-counter'>
            <img
              src={assets.remove_icon_red}
              alt='remove'
              onClick={() => removeFromCart(itemId)}
            />
            <p>{cartItems[itemId]}</p>
            <img
              src={assets.add_icon_green}
              alt='add'
              onClick={() => addToCart(itemId)}
            />
          </div>
        )}
      </div>

      <div className='food-item-info'>
        <div className='food-item-name-rating'>
          <p>{name}</p>
          <img src={assets.rating_starts} alt='rating' />
        </div>
        <p className='food-item-desc'>{description}</p>
        <p className='food-item-price'>${price}</p>
      </div>

    </div>
  )
}

export default FoodItem
