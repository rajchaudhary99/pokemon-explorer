import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllPokemonDetails } from './utils/api';
import PokemonCard from './components/PokemonCard';
import SearchBar from './components/SearchBar';
import TypeFilter from './components/TypeFilter';
import Loading from './components/Loading';
import Pagination from './components/Pagination';
import ErrorBoundary from './components/ErrorBoundary'
import './App.css';

// Cache for Pokémon details
const pokemonCache = new Map();
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

const PokemonListPage = ({ favorites, onToggleFavorite }) => {
  const [pokemon, setPokemon] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonPerPage = 15;

  useEffect(() => {
    const getPokemonData = async () => {
      try {
        const data = await fetchAllPokemonDetails();
        setPokemon(data);
        setFilteredPokemon(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getPokemonData();
  }, []);

  useEffect(() => {
    let results = pokemon;
    if (searchTerm) {
      results = results.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedType !== 'all') {
      results = results.filter(p => p.types.some(t => t.type.name === selectedType));
    }
    setFilteredPokemon(results);
    setCurrentPage(1);
  }, [searchTerm, selectedType, pokemon]);

  const indexOfLastPokemon = currentPage * pokemonPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonPerPage;
  const currentPokemon = filteredPokemon.slice(indexOfFirstPokemon, indexOfLastPokemon);
  const totalPages = Math.ceil(filteredPokemon.length / pokemonPerPage);

  const allTypes = ['all', ...new Set(pokemon.flatMap(p => p.types.map(t => t.type.name)))].sort();

  if (loading) return <Loading />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="pokemon-list-container">
      <div className="filters-section">
        <div className="search-container">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <div className="type-filter-container">
          <TypeFilter types={allTypes} selectedType={selectedType} setSelectedType={setSelectedType} />
        </div>
      </div>
      
      <main className="main-content">
        {currentPokemon.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="no-results-container"
          >
            <img 
              src="/sad-pikachu.png" 
              alt="No results" 
              className="no-results-image" 
            />
            <p className="no-results-text">No Pokémon found matching your criteria</p>
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              layout
              className="pokemon-grid"
            >
              <AnimatePresence>
                {currentPokemon.map(p => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PokemonCard 
                      pokemon={p} 
                      isFavorite={favorites.some(fav => fav.id === p.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

const PokemonDetailPage = ({ favorites, onToggleFavorite }) => {
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

  const handleBackClick = useCallback(() => {
    navigate(-1, { replace: true });
  }, [navigate]);

  const handleToggleFavoriteClick = useCallback(() => {
    if (pokemonData) {
      onToggleFavorite(pokemonData);
    }
  }, [onToggleFavorite, pokemonData]);

  if (loading && !pokemonData) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!pokemonData) return null;

  const typeColor = pokemonData.types[0].type.name;
  const statTotal = pokemonData.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pokemon-details-page"
      style={{ '--type-color': `var(--type-${typeColor})` }}
    >
      <motion.button 
        className="back-button"
        onClick={handleBackClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        &larr; Back to Pokédex
      </motion.button>

      <div className="pokemon-details-container">
        <div className="main-details">
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
            className="pokemon-stats"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stats-header">
              <h3>Base Stats</h3>
              <div className="total-stats">
                <span>Total</span>
                <span className="total-value">{statTotal}</span>
              </div>
            </div>
            <div className="stats-grid">
              {pokemonData.stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-name">{stat.stat.name.replace('-', ' ')}</span>
                  <div className="stat-bar-container">
                    <motion.div 
                      className="stat-bar" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.base_stat / 255) * 100}%` }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                    />
                  </div>
                  <span className="stat-value">{stat.base_stat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="additional-details">
          <motion.div 
            className="detail-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Abilities</h3>
            <div className="abilities">
              {pokemonData.abilities.map((ability, index) => (
                <motion.span 
                  key={index} 
                  className={`ability ${ability.is_hidden ? 'hidden' : ''}`}
                  whileHover={{ scale: 1.05 }}
                >
                  {ability.ability.name.replace('-', ' ')}
                  {ability.is_hidden}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="detail-section"
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
              className="detail-section evolution-section"
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
                        <div className="evolution-image-container">
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

const FavoritePokemons = ({ favorites, onToggleFavorite }) => {
  const navigate = useNavigate();

  const handleBackClick = useCallback(() => {
    navigate(-1, { replace: true });
  }, [navigate]);

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <button 
          className="back-button"
          onClick={handleBackClick}
          aria-label="Go back"
        >
          &larr; Back
        </button>
        <h2>Favorite Pokémons</h2>
      </div>
      
      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <p>You haven't favorited any Pokémon yet.</p>
          <button 
            className="explore-button"
            onClick={() => navigate('/')}
          >
            Explore Pokémon
          </button>
        </div>
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

function App() {
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoritePokemons');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const handleToggleFavorite = useCallback((pokemonData) => {
    const isFavorite = favorites.some(fav => fav.id === pokemonData.id);
    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav.id !== pokemonData.id);
    } else {
      updatedFavorites = [...favorites, {
        id: pokemonData.id,
        name: pokemonData.name,
        sprites: pokemonData.sprites,
        types: pokemonData.types
      }];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('favoritePokemons', JSON.stringify(updatedFavorites));
  }, [favorites]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
          <div className="header-content">
            <div className="logo-container">
              <div className="pokeball-icon">
                <div className="pokeball-center"></div>
              </div>
              <h1 className="app-title">Pokédex Explorer</h1>
            </div>
            <motion.button 
              className={`favorites-toggle ${showFavorites ? 'active' : ''}`}
              onClick={() => setShowFavorites(!showFavorites)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="heart-icon">
                {showFavorites ? (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="filled-heart"
                  >❤️</motion.span>
                ) : (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="outline-heart"
                  >🤍</motion.span>
                )}
              </span>
              {showFavorites ? 'Show All' : `My Favorites (${favorites.length})`}
            </motion.button>
          </div>
        </header>

        <div className="main-content-wrapper">
        <ErrorBoundary>
          <Routes>
            <Route 
              path="/" 
              element={
                showFavorites ? (
                  <FavoritePokemons 
                    favorites={favorites} 
                    onToggleFavorite={handleToggleFavorite} 
                  />
                ) : (
                  <PokemonListPage 
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )
              } 
            />
            <Route 
              path="/pokemon/:id" 
              element={
                <PokemonDetailPage 
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              } 
            />
          </Routes>
         </ErrorBoundary>
        </div>

        {isScrolled && (
          <motion.button 
            className="scroll-to-top"
            onClick={scrollToTop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </motion.button>
        )}

        <footer className="app-footer">
          <div className="footer-content">
            <p>Pokédex Explorer © {new Date().getFullYear()} - Not affiliated with Pokémon</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact</a>
            </div>
            <div className="social-links">
              <a href="#" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;