import React from 'react';
import '../style/TypeFilter.css';

const TypeFilter = ({ types, selectedType, setSelectedType }) => {
  return (
    <div className="type-filter-wrapper">
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="type-select"
      >
        {types.map(type => (
          <option key={type} value={type} className="type-option">
            {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TypeFilter;