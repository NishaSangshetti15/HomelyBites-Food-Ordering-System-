import React, { useState, useEffect } from 'react';
import './HomeChefMenu.css';
import { customerService } from '../../services/customerService';

const HomeChefMenu = ({ chefId, chefName, onClose }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, [chefId]);

  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getChefMenu(chefId);
      if (response.data) {
        setMenuItems(response.data);
      } else {
        setError(response.error || 'Failed to load menu');
      }
    } catch (err) {
      setError(err.message || 'Error loading menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homechef-menu-modal">
      <div className="menu-modal-content">
        <div className="menu-header">
          <h2>{chefName} - Menu</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="loading">Loading menu items...</div>}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchMenuItems}>Retry</button>
          </div>
        )}

        {!loading && !error && menuItems.length === 0 && (
          <div className="no-items">
            <p>No menu items available at the moment.</p>
          </div>
        )}

        {!loading && !error && menuItems.length > 0 && (
          <div className="menu-items-grid">
            {menuItems.map((item) => (
              <div key={item.item_id} className="menu-item-card">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="item-image" />
                )}
                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  <div className="item-footer">
                    <span className="item-price">₹{item.base_price.toFixed(2)}</span>
                    <span className={`item-status ${item.is_available ? 'available' : 'unavailable'}`}>
                      {item.is_available ? '✓ Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeChefMenu;
