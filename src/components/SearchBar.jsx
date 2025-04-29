import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import '../style/SearchBar.css';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="search-container">
      <div className="search-content">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-button" onClick={handleClear}>
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;