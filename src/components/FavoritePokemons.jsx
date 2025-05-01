import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonCard from './PokemonCard';
import '../style/FavoritePokemons.css';

const FavoritePokemons = ({ favorites, onToggleFavorite }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1, { replace: true });
  };

  return (
    <div className="favorites-page">
      <button className="back-button" onClick={handleBackClick}>
        &larr; Back
      </button>
      
      <h2>Favorite Pokémons</h2>
      
      {favorites.length === 0 ? (
        <p>You haven't favorited any Pokémon yet.</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map(pokemon => (
            <PokemonCard 
              key={pokemon.id}
              pokemon={pokemon}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritePokemons;