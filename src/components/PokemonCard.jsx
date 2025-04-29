import React from 'react';


const PokemonCard = ({ pokemon }) => {
  return (
    <div className="pokemon-card">
      <div className="pokemon-image-container">
        <img 
          src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
          alt={pokemon.name} 
          className="pokemon-image"
        />
      </div>
      <div className="pokemon-info">
        <h3 className="pokemon-name">{pokemon.name}</h3>
        <span className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</span>
        <div className="pokemon-types">
          {pokemon.types.map((type, index) => (
            <span 
              key={index} 
              className={`type-badge type-${type.type.name}`}
            >
              {type.type.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;