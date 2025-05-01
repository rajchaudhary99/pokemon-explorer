import React from 'react';
import '../style/CompareModal.css';

const CompareModal = ({ pokemon1, pokemon2, onClose }) => {
  if (!pokemon1 || !pokemon2) return null;

  // Helper function to render stats comparison
  const renderStatComparison = (statName) => {
    const stat1 = pokemon1.stats.find(s => s.stat.name === statName)?.base_stat || 0;
    const stat2 = pokemon2.stats.find(s => s.stat.name === statName)?.base_stat || 0;
    const winner = stat1 > stat2 ? 1 : stat2 > stat1 ? 2 : 0;
    
    return (
      <div className="stat-comparison">
        <span className={`stat-value ${winner === 1 ? 'winner' : ''}`}>{stat1}</span>
        <div className="stat-bar-container">
          <div 
            className={`stat-bar stat-bar-1 ${winner === 1 ? 'winner' : ''}`} 
            style={{ width: `${(stat1 / 255) * 100}%` }}
          ></div>
          <div 
            className={`stat-bar stat-bar-2 ${winner === 2 ? 'winner' : ''}`} 
            style={{ width: `${(stat2 / 255) * 100}%` }}
          ></div>
        </div>
        <span className={`stat-value ${winner === 2 ? 'winner' : ''}`}>{stat2}</span>
      </div>
    );
  };

  return (
    <div className="compare-modal-overlay">
      <div className="compare-modal">
        <button className="close-button" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="modal-header">
          <h2>Pokémon Comparison</h2>
          <div className="divider"></div>
        </div>
        
        <div className="comparison-container">
          <div className="pokemon-comparison">
            <div className="pokemon-info">
              <div className="pokemon-image-container">
                <img 
                  src={pokemon1.sprites.other['official-artwork']?.front_default || pokemon1.sprites.front_default} 
                  alt={pokemon1.name} 
                  className="pokemon-image"
                />
              </div>
              <h3 className="pokemon-name">{pokemon1.name.charAt(0).toUpperCase() + pokemon1.name.slice(1)}</h3>
              <div className="types">
                {pokemon1.types.map((type, i) => (
                  <span key={i} className={`type-badge type-${type.type.name}`}>
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="vs-circle">
              <span>VS</span>
            </div>
            
            <div className="pokemon-info">
              <div className="pokemon-image-container">
                <img 
                  src={pokemon2.sprites.other['official-artwork']?.front_default || pokemon2.sprites.front_default} 
                  alt={pokemon2.name} 
                  className="pokemon-image"
                />
              </div>
              <h3 className="pokemon-name">{pokemon2.name.charAt(0).toUpperCase() + pokemon2.name.slice(1)}</h3>
              <div className="types">
                {pokemon2.types.map((type, i) => (
                  <span key={i} className={`type-badge type-${type.type.name}`}>
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="stats-comparison">
            <div className="stats-header">
              <h3>Stats Comparison</h3>
              <div className="divider"></div>
            </div>
            {['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map(stat => (
              <div key={stat} className="stat-row">
                <span className="stat-name">{stat.replace('-', ' ')}</span>
                {renderStatComparison(stat)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;