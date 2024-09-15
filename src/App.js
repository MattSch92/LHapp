import React from 'react';
import './App.css';
import IngredientList from './IngredientList';
import BackToTopButton from './BackToTopButton';

function App() {
  return (
    <div className="App">
      <h1>Low Histamine Ingredient List</h1>
      <IngredientList />
      <BackToTopButton />
    </div>
  );
}

export default App;
