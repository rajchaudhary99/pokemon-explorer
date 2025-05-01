import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/PokemonCard.css';

const PokemonCard = memo(({ pokemon, isFavorite, onToggleFavorite, onCompare }) => {
  const navigate = useNavigate();

  // Memoize click handlers to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    navigate(`/pokemon/${pokemon.id}`);
  }, [navigate, pokemon.id]);

  const handleFavoriteClick = useCallback((e) => {
    e.stopPropagation();
    onToggleFavorite(pokemon);
  }, [onToggleFavorite, pokemon]);

  const handleCompareClick = useCallback((e) => {
    e.stopPropagation();
    onCompare(pokemon);
  }, [onCompare, pokemon]);

  // Get the primary type for gradient background
  const primaryType = pokemon.types[0].type.name;
  const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const pokemonId = pokemon.id.toString().padStart(3, '0');
  const imageSrc = pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default;

  return (
    <div 
      className={`pokemon-card ${primaryType}`}
      onClick={handleClick}
      data-testid="pokemon-card"
    >
      <div className="card-header">
        <span className="pokemon-id">#{pokemonId}</span>
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <HeartIcon isFavorite={isFavorite} />
        </button>
      </div>
      
      <div className="pokemon-image-container">
        <img 
          src={imageSrc} 
          alt={pokemonName} 
          className="pokemon-image"
          loading="lazy"
          decoding="async"
        />
        <div className="pokeball-bg"></div>
      </div>
      
      <h3 className="pokemon-name">{pokemonName}</h3>
      
      <PokemonTypes types={pokemon.types} />
      
      <div className="pokemon-actions">
        <button
          className="compare-btn"
          onClick={handleCompareClick}
        >
          <CompareIcon />
          Compare
        </button>
      </div>
    </div>
  );
});

// Extracted components to optimize re-renders
const HeartIcon = ({ isFavorite }) => (
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
);

const CompareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 3a9 9 0 0 1 9 9m0 0a9 9 0 0 1-9 9m9-9H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PokemonTypes = memo(({ types }) => (
  <div className="pokemon-types">
    {types.map(t => (
      <span key={t.slot} className={`pokemon-type ${t.type.name}`}>
        {t.type.name}
      </span>
    ))}
  </div>
));

export default PokemonCard;