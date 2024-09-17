import React, { useState, useEffect } from 'react';
import { ingredients } from './ingredients';
import './IngredientList.css';

const IngredientList = () => {
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ rank: '', category: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  useEffect(() => {
    // Retrieve preferences from localStorage
    const storedPreferences = JSON.parse(localStorage.getItem('preferences')) || {};

    // Update ingredient statuses based on stored preferences
    const updatedIngredients = ingredients.map((ingredient) => ({
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
    const updatedIngredients = filteredIngredients.map((ingredient) =>
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
    let tempIngredients = ingredients.map((ingredient) => ({
      ...ingredient,
      status: filteredIngredients.find((fi) => fi.id === ingredient.id)?.status || null,
    }));

    tempIngredients = tempIngredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filter.rank) {
      tempIngredients = tempIngredients.filter(
        (ingredient) => ingredient.rank === parseInt(filter.rank)
      );
    }

    if (filter.category) {
      tempIngredients = tempIngredients.filter(
        (ingredient) => ingredient.category === filter.category
      );
    }

    if (filter.status) {
      tempIngredients = tempIngredients.filter(
        (ingredient) => ingredient.status === filter.status
      );
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

  // Modal component
  const Modal = ({ show, onClose, onYes, onNo, ingredient }) => {
    if (!show || !ingredient) {
      return null;
    }

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <h3>{`Does "${ingredient.name}" work for you?`}</h3>
          <button onClick={() => { onYes(); onClose(); }}>Yes</button>
          <button onClick={() => { onNo(); onClose(); }}>No</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="header">
        Provided by the Swiss Interest Group Histamine Intolerance (SIGHI)
        <br />
        <p>
          Compatibility list for diagnostic and therapeutic elimination diet at
          histaminosis (mast cell activation syndrome MCAS, mastocytosis, histamine
          intolerance)
        </p>
      </h1>

      {/* ...Compatibility chart code... */}

      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-input"
      />

      {/* Filter selectors */}
      <select
        onChange={(e) => setFilter({ ...filter, rank: e.target.value })}
        className="filter-select"
      >
        <option value="">All Ranks</option>
        {/* ...other options... */}
      </select>

      <select
        onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        className="filter-select"
      >
        <option value="">All Categories</option>
        {/* ...other options... */}
      </select>

      <select
        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        className="filter-select"
      >
        <option value="">All</option>
        <option value="works">Works for me</option>
        <option value="doesn't work">Doesn't work for me</option>
      </select>

      <table className="ingredient-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('name')}>
              Ingredient{' '}
              {sortConfig.key === 'name'
                ? sortConfig.direction === 'ascending'
                  ? '▲'
                  : '▼'
                : ''}
            </th>
            <th onClick={() => requestSort('category')}>
              Category{' '}
              {sortConfig.key === 'category'
                ? sortConfig.direction === 'ascending'
                  ? '▲'
                  : '▼'
                : ''}
            </th>
            <th onClick={() => requestSort('rank')}>
              Rank{' '}
              {sortConfig.key === 'rank'
                ? sortConfig.direction === 'ascending'
                  ? '▲'
                  : '▼'
                : ''}
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredIngredients.map((ingredient) => (
            <tr
              key={ingredient.id}
              style={{
                backgroundColor:
                  ingredient.status === 'works'
                    ? 'lightgreen'
                    : ingredient.status === "doesn't work"
                    ? 'lightcoral'
                    : 'white',
                cursor: 'pointer',
              }}
              onClick={() => {
                setSelectedIngredient(ingredient);
                setIsModalOpen(true);
              }}
            >
              <td>{ingredient.name}</td>
              <td className="category-box">{ingredient.category}</td>
              <td>
                <div className={`rank-box rank-${ingredient.rank}`}>
                  {ingredient.rank}
                </div>
              </td>
              <td>
                {ingredient.status
                  ? ingredient.status === 'works'
                    ? '✔️ Works'
                    : "❌ Doesn't Work"
                  : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for user input */}
      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onYes={() => handleStatusChange(selectedIngredient.id, 'works')}
        onNo={() => handleStatusChange(selectedIngredient.id, "doesn't work")}
        ingredient={selectedIngredient}
      />
    </div>
  );
};

export default IngredientList;
