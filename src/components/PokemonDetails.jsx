import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../style/PokemonDetails.css';
import PokemonCard from './PokemonCard';

const pokemonCache = new Map();
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

const PokemonDetails = ({ favorites, onToggleFavorite }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pokemonData, setPokemonData] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);

  const isFavorite = favorites.some(fav => fav.id === parseInt(id));

  const parseEvolutionChain = useCallback((chain) => {
    const evolutions = [];
    const seen = new Set();

    const processChain = (currentChain) => {
      const pokemonId = currentChain.species.url.split('/').slice(-2, -1)[0];
      if (!seen.has(pokemonId)) {
        seen.add(pokemonId);
        evolutions.push({
          id: pokemonId,
          name: currentChain.species.name,
        });
      }
      currentChain.evolves_to.forEach(processChain);
    };

    processChain(chain);
    setEvolutionChain(evolutions);
    return evolutions;
  }, []);

  const fetchWithCache = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cached = pokemonCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
        setPokemonData(cached.pokemonData);
        setEvolutionChain(cached.evolutionChain);
        setLoading(false);
        return;
      }

      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
      ]);

      if (!pokemonRes.ok || !speciesRes.ok) throw new Error('Pokémon not found');

      const [pokemonData, speciesData] = await Promise.all([
        pokemonRes.json(),
        speciesRes.json()
      ]);

      let evoChain = [];
      if (speciesData.evolution_chain?.url) {
        const evolutionRes = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionRes.json();
        evoChain = parseEvolutionChain(evolutionData.chain);
      }

      setPokemonData(pokemonData);
      setEvolutionChain(evoChain);
      pokemonCache.set(id, {
        pokemonData,
        evolutionChain: evoChain,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, parseEvolutionChain]);

  useEffect(() => {
    fetchWithCache();
  }, [fetchWithCache]);

  const handleBackClick = () => {
    navigate(-1, { replace: true });
  };

  const handleToggleFavoriteClick = useCallback(() => {
    if (pokemonData) {
      onToggleFavorite(pokemonData);
    }
  }, [onToggleFavorite, pokemonData]);

  if (error) return <div className="pokedetails-error">{error}</div>;
  if (!pokemonData) return null;

  const typeColor = pokemonData.types[0].type.name;
  const statTotal = pokemonData.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pokedetails-page"
      style={{ '--type-color': `var(--type-${typeColor})` }}
    >
      <motion.button 
        className="pokedetails-back-btn"
        onClick={handleBackClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        &larr; Back to Pokédex
      </motion.button>

      <div className="pokedetails-container">
        <div className="pokedetails-main">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <PokemonCard 
              pokemon={pokemonData} 
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavoriteClick}
              detailedView
            />
          </motion.div>

          <motion.div 
            className="pokedetails-stats"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stats-header">
              <h3>Base Stats</h3>
              <div className="stats-total">
                <span>Total</span>
                <span className="stats-total-value">{statTotal}</span>
              </div>
            </div>
            <div className="stats-grid">
              {pokemonData.stats.map((stat, index) => (
                <div key={index} className="stats-item">
                  <span className="stats-name">{stat.stat.name.replace('-', ' ')}</span>
                  <div className="stats-bar-container">
                    <motion.div 
                      className="stats-bar" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.base_stat / 255) * 100}%` }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                    />
                  </div>
                  <span className="stats-value">{stat.base_stat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="pokedetails-side">
          <motion.div 
            className="pokedetails-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Abilities</h3>
            <div className="abilities-list">
              {pokemonData.abilities.map((ability, index) => (
                <motion.span 
                  key={index} 
                  className={`ability-tag ${ability.is_hidden ? 'hidden' : ''}`}
                  whileHover={{ scale: 1.05 }}
                >
                  {ability.ability.name.replace('-', ' ')}
                  {ability.is_hidden && <span className="ability-hidden">hidden</span>}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="pokedetails-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <h3>Physical Details</h3>
            <div className="physical-details">
              <div className="physical-item">
                <span className="physical-label">Height</span>
                <span className="physical-value">{(pokemonData.height / 10).toFixed(1)} m</span>
              </div>
              <div className="physical-item">
                <span className="physical-label">Weight</span>
                <span className="physical-value">{(pokemonData.weight / 10).toFixed(1)} kg</span>
              </div>
            </div>
          </motion.div>

          {evolutionChain.length > 0 && (
            <motion.div 
              className="pokedetails-section evolution-section"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3>Evolution Chain</h3>
              <div className="evolution-chain">
                <AnimatePresence>
                  {evolutionChain.map((evo, index) => (
                    <React.Fragment key={evo.id}>
                      <motion.div 
                        className="evolution-item"
                        onClick={() => navigate(`/pokemon/${evo.id}`)}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 + index * 0.1 }}
                      >
                        <div className="evolution-img-container">
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`} 
                            alt={evo.name} 
                            onError={(e) => {
                              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`;
                            }}
                          />
                        </div>
                        <span className="evolution-name">{evo.name}</span>
                      </motion.div>
                      {index < evolutionChain.length - 1 && (
                        <motion.span 
                          className="evolution-arrow"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          →
                        </motion.span>
                      )}
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PokemonDetails;