import React, { useState, useEffect } from 'react';
import { ingredients } from './ingredients';
import './IngredientList.css';

// Modal component for status
const Modal = React.memo(({ show, onClose, onYes, onNo, ingredient }) => {
  if (!show || !ingredient) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{`Does "${ingredient.name}" work for you?`}</h3>
        <button
          onClick={() => {
            onYes();
            onClose();
          }}
        >
          Yes
        </button>
        <button
          onClick={() => {
            onNo();
            onClose();
          }}
        >
          No
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
});

// Modal component for notes
const NoteModal = React.memo(({ show, onClose, onSave, ingredient }) => {
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (ingredient) {
      setNoteText(ingredient.note || '');
    }
  }, [ingredient]);

  if (!show || !ingredient) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{`Add Note for "${ingredient.name}"`}</h3>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={4}
          cols={50}
        />
        <div>
          <button
            onClick={() => {
              onSave(noteText);
              onClose();
            }}
          >
            Save
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
});

const IngredientList = () => {
  const [ingredientsWithStatus, setIngredientsWithStatus] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ rank: '', category: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Load ingredients with statuses and notes from localStorage
  useEffect(() => {
    const storedPreferences = JSON.parse(localStorage.getItem('preferences')) || {};
    const storedNotes = JSON.parse(localStorage.getItem('notes')) || {};

    const updatedIngredients = ingredients.map((ingredient) => ({
      ...ingredient,
      status: storedPreferences[ingredient.id] || null,
      note: storedNotes[ingredient.id] || '',
    }));

    setIngredientsWithStatus(updatedIngredients);
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filter, sortConfig, ingredientsWithStatus]);

  const savePreferences = (ingredients) => {
    const preferences = ingredients.reduce((acc, ingredient) => {
      if (ingredient.status) {
        acc[ingredient.id] = ingredient.status;
      }
      return acc;
    }, {});
    localStorage.setItem('preferences', JSON.stringify(preferences));
  };

  const saveNotes = (ingredients) => {
    const notes = ingredients.reduce((acc, ingredient) => {
      if (ingredient.note) {
        acc[ingredient.id] = ingredient.note;
      }
      return acc;
    }, {});
    localStorage.setItem('notes', JSON.stringify(notes));
  };

  const handleStatusChange = (id, status) => {
    const updatedIngredients = ingredientsWithStatus.map((ingredient) =>
      ingredient.id === id ? { ...ingredient, status } : ingredient
    );

    setIngredientsWithStatus(updatedIngredients);
    savePreferences(updatedIngredients);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const applyFilters = () => {
    let tempIngredients = [...ingredientsWithStatus];

    // Apply search query
    tempIngredients = tempIngredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply rank filter
    if (filter.rank) {
      tempIngredients = tempIngredients.filter(
        (ingredient) => ingredient.rank === parseInt(filter.rank)
      );
    }

    // Apply category filter
    if (filter.category) {
      tempIngredients = tempIngredients.filter(
        (ingredient) => ingredient.category === filter.category
      );
    }

    // Apply status filter
    if (filter.status) {
      tempIngredients = tempIngredients.filter(
        (ingredient) => ingredient.status === filter.status
      );
    }

    // Apply sorting
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

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }
    return '';
  };

  const handleAddNoteClick = (e, ingredient) => {
    e.stopPropagation(); // Prevent the row click event
    setSelectedIngredient(ingredient);
    setIsNoteModalOpen(true);
  };

  const handleEditNoteClick = (e, ingredient) => {
    e.stopPropagation(); // Prevent the row click event
    setSelectedIngredient(ingredient);
    setIsNoteModalOpen(true);
  };

  const handleNoteSave = (noteText) => {
    const updatedIngredients = ingredientsWithStatus.map((ingredient) =>
      ingredient.id === selectedIngredient.id
        ? { ...ingredient, note: noteText }
        : ingredient
    );

    setIngredientsWithStatus(updatedIngredients);
    saveNotes(updatedIngredients);
  };

  return (
    <div>
      <h1 className="header">
        Provided by the Swiss Interest Group Histamine Intolerance (SIGHI)
        <br />
        <p>
          Compatibility list for diagnostic and therapeutic elimination diet at
          histaminosis (mast cell activation syndrome MCAS, mastocytosis, histamine intolerance)
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
        <option value="0">Rank 0: Well tolerated</option>
        <option value="1">Rank 1: Moderately Compatible</option>
        <option value="2">Rank 2: Incompatible</option>
        <option value="3">Rank 3: Very Poorly Tolerated</option>
        <option value="5">Rank 5: Insufficient or contradictory information</option>
      </select>

      <select
        onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        className="filter-select"
      >
        <option value="">All Categories</option>
        {/* Add other category options as needed */}
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
        <option value="Vitamins, Dietary Minerals, Trace Elements, & Stimulants">
          Vitamins, Dietary Minerals, Trace Elements, & Stimulants
        </option>
        <option value="Preparations & mixtures">Preparations & Mixtures</option>
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
              Ingredient {getSortIndicator('name')}
            </th>
            <th onClick={() => requestSort('category')}>
              Category {getSortIndicator('category')}
            </th>
            <th onClick={() => requestSort('rank')}>
              Rank {getSortIndicator('rank')}
            </th>
            <th>Status</th>
            <th>Notes</th>
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
              <td>
                {ingredient.note ? (
                  <span
                    onClick={(e) => handleEditNoteClick(e, ingredient)}
                    className="note-text"
                  >
                    {ingredient.note}
                  </span>
                ) : (
                  <button
                    onClick={(e) => handleAddNoteClick(e, ingredient)}
                  >
                    Add Note
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modals */}
      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onYes={() => handleStatusChange(selectedIngredient.id, 'works')}
        onNo={() => handleStatusChange(selectedIngredient.id, "doesn't work")}
        ingredient={selectedIngredient}
      />

      <NoteModal
        show={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleNoteSave}
        ingredient={selectedIngredient}
      />
    </div>
  );
};

export default IngredientList;
