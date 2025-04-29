import React, { useState, useEffect } from 'react';
import { fetchAllPokemonDetails } from './utils/api';
import PokemonCard from './components/PokemonCard';
import SearchBar from './components/SearchBar';
import TypeFilter from './components/TypeFilter';
import Loading from './components/Loading';
import Pagination from './components/Pagination';
import './App.css';

function App() {
  const [pokemon, setPokemon] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonPerPage] = useState(15);

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
      results = results.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType !== 'all') {
      results = results.filter(p => 
        p.types.some(t => t.type.name === selectedType)
      );
    }
    
    setFilteredPokemon(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedType, pokemon]);

  // Get current pokemon for pagination
  const indexOfLastPokemon = currentPage * pokemonPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonPerPage;
  const currentPokemon = filteredPokemon.slice(indexOfFirstPokemon, indexOfLastPokemon);
  const totalPages = Math.ceil(filteredPokemon.length / pokemonPerPage);

  const allTypes = ['all', ...new Set(
    pokemon.flatMap(p => p.types.map(t => t.type.name))
  )].sort();

  if (loading) return <Loading />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Pokémon Explorer</h1>
          <div className="pokeball-icon"></div>
        </div>
      </header>
      
      <div className="filters-section">
        <div className="search-container">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <div className="type-filter-container">
          <TypeFilter 
            types={allTypes} 
            selectedType={selectedType} 
            setSelectedType={setSelectedType} 
          />
        </div>
      </div>
      
      <main className="main-content">
        {currentPokemon.length === 0 ? (
          <div className="no-results-container">
            <img src="/sad-pikachu.png" alt="No results" className="no-results-image" />
            <p className="no-results-text">No Pokémon found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="pokemon-grid">
              {currentPokemon.map(p => (
                <PokemonCard key={p.id} pokemon={p} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Pokémon Explorer © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;