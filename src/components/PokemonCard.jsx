import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/PokemonCard.css';

const PokemonCard = ({ pokemon, isFavorite, onToggleFavorite, onCompare }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/pokemon/${pokemon.id}`);
  };

  // Get the primary type for gradient background
  const primaryType = pokemon.types[0].type.name;

  return (
    <div 
      className={`pokemon-card ${primaryType}`}
      onClick={handleClick}
      data-testid="pokemon-card"
    >
      <div className="card-header">
        <span className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</span>
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(pokemon);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill={isFavorite ? "#ffcb05" : "none"} 
            stroke={isFavorite ? "#ffcb05" : "#ffffff"} 
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>
      
      <div className="pokemon-image-container">
        <img 
          src={pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default} 
          alt={pokemon.name} 
          className="pokemon-image"
          loading="lazy"
        />
        <div className="pokeball-bg"></div>
      </div>
      
      <h3 className="pokemon-name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
      
      <div className="pokemon-types">
        {pokemon.types.map(t => (
          <span key={t.slot} className={`pokemon-type ${t.type.name}`}>
            {t.type.name}
          </span>
        ))}
      </div>
      
     
    </div>
  );
};

export default PokemonCard;