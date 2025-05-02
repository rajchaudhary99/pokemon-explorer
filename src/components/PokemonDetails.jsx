// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaArrowLeft, FaHeart, FaRegHeart, FaWeight, FaRulerVertical } from 'react-icons/fa';
// import { GiSpikedDragonHead, GiSwordWound, GiShield, GiRunningShoe, GiEnergyArrow, GiThreeFriends } from 'react-icons/gi';

// import PokemonCard from './PokemonCard';

// // Cache with expiration (1 hour)
// const pokemonCache = new Map();
// const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

// const statIcons = {
//   hp: <GiSpikedDragonHead className="stat-icon" />,
//   attack: <GiSwordWound className="stat-icon" />,
//   defense: <GiShield className="stat-icon" />,
//   'special-attack': <GiEnergyArrow className="stat-icon" />,
//   'special-defense': <GiShield className="stat-icon" />,
//   speed: <GiRunningShoe className="stat-icon" />
// };

// const PokemonDetails = ({ favorites, onToggleFavorite }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [pokemonData, setPokemonData] = useState(null);
//   const [evolutionChain, setEvolutionChain] = useState([]);

//   const isFavorite = favorites.some(fav => fav.id === parseInt(id));

//   const parseEvolutionChain = useCallback((chain) => {
//     const evolutions = [];
//     const seen = new Set();

//     const processChain = (currentChain) => {
//       const pokemonId = currentChain.species.url.split('/').slice(-2, -1)[0];
//       if (!seen.has(pokemonId)) {
//         seen.add(pokemonId);
//         evolutions.push({
//           id: pokemonId,
//           name: currentChain.species.name,
//         });
//       }
//       currentChain.evolves_to.forEach(processChain);
//     };

//     processChain(chain);
//     setEvolutionChain(evolutions);
//     return evolutions;
//   }, []);

//   const fetchWithCache = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Check cache first
//       const cached = pokemonCache.get(id);
//       if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
//         setPokemonData(cached.pokemonData);
//         setEvolutionChain(cached.evolutionChain);
//         setLoading(false);
//         return;
//       }

//       // Fetch fresh data
//       const [pokemonRes, speciesRes] = await Promise.all([
//         fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
//         fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
//       ]);

//       if (!pokemonRes.ok || !speciesRes.ok) throw new Error('Pokémon not found');

//       const [pokemonData, speciesData] = await Promise.all([
//         pokemonRes.json(),
//         speciesRes.json()
//       ]);

//       let evoChain = [];
//       if (speciesData.evolution_chain?.url) {
//         const evolutionRes = await fetch(speciesData.evolution_chain.url);
//         const evolutionData = await evolutionRes.json();
//         evoChain = parseEvolutionChain(evolutionData.chain);
//       }

//       // Update state and cache
//       setPokemonData(pokemonData);
//       setEvolutionChain(evoChain);
//       pokemonCache.set(id, {
//         pokemonData,
//         evolutionChain: evoChain,
//         timestamp: Date.now()
//       });
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [id, parseEvolutionChain]);

//   useEffect(() => {
//     fetchWithCache();
//   }, [fetchWithCache]);

//   const handleBackClick = () => {
//     navigate(-1, { replace: true });
//   };

//   const handleToggleFavoriteClick = useCallback(() => {
//     if (pokemonData) {
//       onToggleFavorite(pokemonData);
//     }
//   }, [onToggleFavorite, pokemonData]);

//   if (error) return (
//     <motion.div 
//       className="error-message"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//     >
//       <div className="error-content">
//         <h2>Pokémon Not Found</h2>
//         <p>{error}</p>
//         <button onClick={handleBackClick} className="back-button">
//           <FaArrowLeft /> Back to Pokédex
//         </button>
//       </div>
//     </motion.div>
//   );

//   if (!pokemonData) return null;

//   const typeColor = pokemonData.types[0].type.name;
//   const statTotal = pokemonData.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="pokemon-details-page"
//       style={{ '--type-color': `var(--type-${typeColor})` }}
//     >
//       <div className="background-pattern"></div>
      
//       <motion.button 
//         className="back-button"
//         onClick={handleBackClick}
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//       >
//         <FaArrowLeft /> Back to Pokédex
//       </motion.button>

//       <div className="pokemon-details-container">
//         <div className="main-details">
//           <motion.div
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.1 }}
//             className="pokemon-card-container"
//           >
//             <PokemonCard 
//               pokemon={pokemonData} 
//               isFavorite={isFavorite}
//               onToggleFavorite={handleToggleFavoriteClick}
//               detailedView
//             />
//           </motion.div>

//           <motion.div 
//             className="pokemon-stats glass-card"
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             <div className="stats-header">
//               <h3>Base Stats</h3>
//               <div className="total-stats">
//                 <span>Total</span>
//                 <span className="total-value">{statTotal}</span>
//               </div>
//             </div>
//             <div className="stats-grid">
//               {pokemonData.stats.map((stat, index) => (
//                 <div key={index} className="stat-item">
//                   <div className="stat-name-container">
//                     {statIcons[stat.stat.name] || <GiThreeFriends className="stat-icon" />}
//                     <span className="stat-name">{stat.stat.name.replace('-', ' ')}</span>
//                   </div>
//                   <div className="stat-bar-container">
//                     <motion.div 
//                       className="stat-bar" 
//                       initial={{ width: 0 }}
//                       animate={{ width: `${(stat.base_stat / 255) * 100}%` }}
//                       transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
//                     />
//                     <span className="stat-value">{stat.base_stat}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         </div>

//         <div className="additional-details">
//           <motion.div 
//             className="detail-section glass-card"
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.3 }}
//           >
//             <h3>Abilities</h3>
//             <div className="abilities">
//               {pokemonData.abilities.map((ability, index) => (
//                 <motion.div
//                   key={index} 
//                   className={`ability ${ability.is_hidden ? 'hidden' : ''}`}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <span className="ability-name">{ability.ability.name.replace('-', ' ')}</span>
//                   {ability.is_hidden && <span className="hidden-label">hidden</span>}
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>

//           <motion.div 
//             className="detail-section glass-card"
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.35 }}
//           >
//             <h3>Physical Details</h3>
//             <div className="physical-details">
//               <div className="physical-item">
//                 <div className="physical-icon">
//                   <FaRulerVertical />
//                 </div>
//                 <div className="physical-info">
//                   <span className="physical-label">Height</span>
//                   <span className="physical-value">{(pokemonData.height / 10).toFixed(1)} m</span>
//                 </div>
//               </div>
//               <div className="physical-item">
//                 <div className="physical-icon">
//                   <FaWeight />
//                 </div>
//                 <div className="physical-info">
//                   <span className="physical-label">Weight</span>
//                   <span className="physical-value">{(pokemonData.weight / 10).toFixed(1)} kg</span>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {evolutionChain.length > 0 && (
//             <motion.div 
//               className="detail-section evolution-section glass-card"
//               initial={{ y: 20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ delay: 0.4 }}
//             >
//               <h3>Evolution Chain</h3>
//               <div className="evolution-chain">
//                 <AnimatePresence>
//                   {evolutionChain.map((evo, index) => (
//                     <React.Fragment key={evo.id}>
//                       <motion.div 
//                         className="evolution-item"
//                         onClick={() => navigate(`/pokemon/${evo.id}`)}
//                         whileHover={{ y: -5 }}
//                         whileTap={{ scale: 0.95 }}
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.45 + index * 0.1 }}
//                       >
//                         <div className="evolution-image-container">
//                           <img 
//                             src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`} 
//                             alt={evo.name} 
//                             onError={(e) => {
//                               e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`;
//                             }}
//                           />
//                         </div>
//                         <span className="evolution-name">{evo.name}</span>
//                         <span className="evolution-id">#{evo.id.toString().padStart(3, '0')}</span>
//                       </motion.div>
//                       {index < evolutionChain.length - 1 && (
//                         <motion.div 
//                           className="evolution-arrow"
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           transition={{ delay: 0.5 + index * 0.1 }}
//                         >
//                           <div className="arrow-line"></div>
//                           <div className="arrow-head"></div>
//                         </motion.div>
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default PokemonDetails;