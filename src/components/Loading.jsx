import React from 'react';
import '../style/Loading.css';

const Loading = () => {
    return (
      <div className="pokemon-loading-screen">
        <div className="loading-background"></div>
        
        <div className="loading-content">
          <div className="pokeball-animation">
            <div className="pokeball">
              <div className="pokeball-top"></div>
              <div className="pokeball-bottom"></div>
              <div className="pokeball-center"></div>
            </div>
            <div className="rotating-elements">
              <div className="pokemon-element fire-spin">🔥</div>
              <div className="pokemon-element water-spin">💧</div>
              <div className="pokemon-element grass-spin">🌿</div>
            </div>
          </div>
          
          <div className="loading-text">
            <h3>Gotta Load 'Em All!</h3>
            <p>Your Pokémon adventure is loading...</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Loading;