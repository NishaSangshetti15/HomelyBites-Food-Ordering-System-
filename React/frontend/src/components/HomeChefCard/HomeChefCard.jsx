import React from 'react';
import './HomeChefCard.css';

const HomeChefCard = ({ chef, onViewMenu }) => {
  return (
    <div className="homechef-card">
      <div className="chef-header">
        <h3 className="chef-name">{chef.business_name}</h3>
        <span className="chef-rating">⭐ {chef.average_rating ? chef.average_rating.toFixed(1) : 'N/A'}</span>
      </div>
      
      <div className="chef-details">
        <p className="chef-contact">
          <span className="label">📞 Phone:</span> {chef.phone_number || 'N/A'}
        </p>
        <p className="chef-email">
          <span className="label">📧 Email:</span> {chef.email}
        </p>
        <p className="chef-joined">
          <span className="label">📅 Joined:</span> {new Date(chef.created_at).toLocaleDateString()}
        </p>
      </div>

      <button 
        className="view-menu-btn"
        onClick={() => onViewMenu(chef.chef_id, chef.business_name)}
      >
        View Menu
      </button>
    </div>
  );
};

export default HomeChefCard;
