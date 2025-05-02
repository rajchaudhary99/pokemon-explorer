// import React, { useState, useEffect } from 'react';
// import PokemonCard from './PokemonCard';
// // Suggested code may be subject to a license. Learn more: ~LicenseLog:671458419.
// import '../style/FavoritePokemons.css'

// const FavoritePokemons = () => {
//   const [favorites, setFavorites] = useState([]);

//   // Load favorites from localStorage when component mounts
//   useEffect(() => {
//     const loadFavorites = () => {
//       const storedFavorites = localStorage.getItem('favoritePokemons');
//       if (storedFavorites) {
//         setFavorites(JSON.parse(storedFavorites));
//       }
//     };
    
//     loadFavorites();
    
//     // Add event listener for storage changes (from other tabs/windows)
//     window.addEventListener('storage', loadFavorites);
//     return () => window.removeEventListener('storage', loadFavorites);
//   }, []);

//   const handleRemoveFavorite = (pokemonId) => {
//     const updatedFavorites = favorites.filter(fav => fav.id !== pokemonId);
//     setFavorites(updatedFavorites);
//     localStorage.setItem('favoritePokemons', JSON.stringify(updatedFavorites));
//   };

//   return (
//     <div className="favorites-page">
//       <h2>Favorite Pokémons</h2>
//       {favorites.length === 0 ? (
//         <p>You haven't favorited any Pokémon yet.</p>
//       ) : (
//         <div className="favorites-grid">
//           {favorites.map(pokemon => (
//             <PokemonCard 
//               key={pokemon.id}
//               pokemon={pokemon}
//               showRemoveButton={true}
//               onRemoveFavorite={handleRemoveFavorite}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FavoritePokemons;