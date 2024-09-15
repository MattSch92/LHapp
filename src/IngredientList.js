import React, { useState, useEffect } from 'react';
import { ingredients } from './ingredients';
import './IngredientList.css';

const IngredientList = () => {
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ rank: '', category: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  useEffect(() => {
    // Retrieve preferences from localStorage
    const storedPreferences = JSON.parse(localStorage.getItem('preferences')) || {};

    // Update ingredient statuses based on stored preferences
    const updatedIngredients = ingredients.map(ingredient => ({
      ...ingredient,
      status: storedPreferences[ingredient.id] || null,
    }));
    setFilteredIngredients(updatedIngredients);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filter, sortConfig]);

  const handleStatusChange = (id, status) => {
    // Update the ingredient status
    const updatedIngredients = filteredIngredients.map(ingredient =>
      ingredient.id === id ? { ...ingredient, status } : ingredient
    );
    setFilteredIngredients(updatedIngredients);

    // Save preferences to localStorage
    const preferences = updatedIngredients.reduce((acc, ingredient) => {
      if (ingredient.status) {
        acc[ingredient.id] = ingredient.status;
      }
      return acc;
    }, {});
    localStorage.setItem('preferences', JSON.stringify(preferences));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const applyFilters = () => {
    let tempIngredients = ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filter.rank) {
      tempIngredients = tempIngredients.filter(ingredient => ingredient.rank === parseInt(filter.rank));
    }

    if (filter.category) {
      tempIngredients = tempIngredients.filter(ingredient => ingredient.category === filter.category);
    }

    if (filter.status) {
      tempIngredients = tempIngredients.filter(ingredient => ingredient.status === filter.status);
    }

    if (sortConfig.key) {
      tempIngredients.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredIngredients(tempIngredients);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <h1 className="header">Provided by the Swiss Interest Group Histamine Intolderance (SIGHI)
        <br></br>
        <p>Compatability list for diagnostic and therapeautic elimination diet at histaminosis (mast cell activation syndrome MCAS, mastocytosis, histamine intolerance)</p>
      </h1>
      
      <div className="chart-container">
  <h2 className="compatScale">Compatibility Rank Scale</h2>
  <div className="compatibility-chart">
    <div className="compatibility-row">
      <span className="compatibility-label-0">0</span>
      <span className="compatibility-description">Well tolerated, no symptoms expected at usual intake</span>
    </div>
    <div className="compatibility-row">
      <span className="compatibility-label-1">1</span>
      <span className="compatibility-description">Moderately compatible, minor symptoms, occasional consumption of small quantities is often tolerated</span>
    </div>
    <div className="compatibility-row">
      <span className="compatibility-label-2">2</span>
      <span className="compatibility-description">Incompatible, significant symptoms at usual intake</span>
    </div>
    <div className="compatibility-row">
      <span className="compatibility-label-3">3</span>
      <span className="compatibility-description">Very poorly tolerated, severe symptoms</span>
    </div>
    <div className="compatibility-row">
      <span className="compatibility-label-4">-</span>
      <span className="compatibility-description">No general statement possible</span>
    </div>
    <div className="compatibility-row">
      <span className="compatibility-label-5">?</span>
      <span className="compatibility-description">Insufficient or contradictory information</span>
    </div>
  </div>
</div>


      <input 
        type="text" 
        placeholder="Search..." 
        value={searchQuery} 
        onChange={handleSearch} 
        className="search-input"
      />

      <select onChange={(e) => setFilter({ ...filter, rank: e.target.value })} className="filter-select">
        <option value="">All Ranks</option>
        <option value="0">Rank 0: Well tolerated</option>
        <option value="1">Rank 1: Moderately Compatible</option>
        <option value="2">Rank 2: Incompatible</option>
        <option value="3">Rank 3: Very Poorly Tolerated</option>
        <option value="5">Rank 5: Insufficient or contradictory information</option>
      </select>

      <select onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="filter-select">
        <option value="">All Categories</option>
        <option value="Eggs">Eggs</option>
        <option value="Dairy Products">Dairy Products</option>
        <option value="Meat">Meat</option>
        <option value="Seafood">Seafood</option>
        <option value="Starch">Starch</option>
        <option value="Nuts">Nuts</option>
        <option value="Fats and Oils">Fats and Oils</option>
        <option value="Vegetables">Vegetables</option>
        <option value="Herbs">Herbs</option>
        <option value="Fruits">Fruits</option>
        <option value="Seeds">Seeds</option>
        <option value="Mushrooms, Fungi, & Algae">Mushrooms, Fungi, & Algae</option>
        <option value="Sweeteners">Sweeteners</option>
        <option value="Spices, Seasoning, Aroma">Spices, Seasoning, & Aroma</option>
        <option value="Beverages">Beverages</option>
        <option value="Food Additives">Food Additives</option>
        <option value="Vitamins, Dietary Minerals, Trace Elements, & Stimulants">Vitamins, Dietary Minerals, Trace Elements, & Stimulants</option>
        <option value="Preparations & mixtures">Preparations & Mixtures</option>
      </select>

      <select onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="filter-select">
        <option value="">All</option>
        <option value="works">Works for me</option>
        <option value="doesn't work">Doesn't work for me</option>
      </select>

      <table className="ingredient-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('name')}>
              Ingredient {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => requestSort('category')}>
              Category {sortConfig.key === 'category' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => requestSort('rank')}>
              Rank {sortConfig.key === 'rank' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredIngredients.map(ingredient => (
            <tr 
              key={ingredient.id} 
              style={{ 
                backgroundColor: ingredient.status === 'works' ? 'lightgreen' : ingredient.status === "doesn't work" ? 'lightcoral' : 'white',
                cursor: 'pointer'
              }}
              onClick={() => {
                const userChoice = window.confirm("Does this ingredient work for you?");
                handleStatusChange(ingredient.id, userChoice ? 'works' : "doesn't work");
              }}
            >
              <td>{ingredient.name}</td>
              <td className="category-box">{ingredient.category}</td>
              <td>
                <div className={`rank-box rank-${ingredient.rank}`}>
                  {ingredient.rank}
                </div>
              </td>
              <td>{ingredient.status ? (ingredient.status === 'works' ? '✔️ Works' : '❌ Doesn\'t Work') : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IngredientList;
