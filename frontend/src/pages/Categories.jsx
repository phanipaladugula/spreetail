import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import './Categories.css';

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '💰',
    color: '#0066ff'
  });
  const [loading, setLoading] = useState(true);

  const categoryIcons = ['💰', '🏠', '🍕', '🚗', '🎬', '🛒', '☕', '🎒', '🎁', '💊', '✈️', '🏥', '📱', '💻', '📚', '🎮', '🎵', '🎨', '🏋️', '🍎', '🍷', '🏨', '🚕', '⛽', '🔌', '💡', '📱'];

  const categoryColors = [
    '#0066ff', '#00d4ff', '#00ff88', '#aaff00', '#ffdd00',
    '#ff6600', '#ff0066', '#ff00ff', '#aa00ff', '#6600ff',
    '#00aaff', '#00ffaa', '#ffaa00', '#ff00aa', '#aa00ff'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await api.getCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : getDefaultCategories());
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(getDefaultCategories());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCategories = () => [
    { id: 1, name: 'Rent & Housing', icon: '🏠', color: '#0066ff' },
    { id: 2, name: 'Groceries', icon: '🛒', color: '#00d4ff' },
    { id: 3, name: 'Dining Out', icon: '🍕', color: '#ff6600' },
    { id: 4, name: 'Transportation', icon: '🚗', color: '#ff0066' },
    { id: 5, name: 'Utilities', icon: '💡', color: '#ffdd00' },
    { id: 6, name: 'Entertainment', icon: '🎬', color: '#ff00ff' },
    { id: 7, name: 'Shopping', icon: '🛍️', color: '#ff00aa' },
    { id: 8, name: 'Healthcare', icon: '🏥', color: '#00ff88' },
    { id: 9, name: 'Travel', icon: '✈️', color: '#aaff00' },
    { id: 10, name: 'Education', icon: '📚', color: '#aa00ff' }
  ];

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory(newCategory);
      setShowAddModal(false);
      setNewCategory({ name: '', icon: '💰', color: '#0066ff' });
      alert('Category added!');
      loadCategories();
    } catch (error) {
      alert('Failed to add category: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <header className="page-header">
        <Logo />
        <div className="page-title">
          <h1>Categories</h1>
          <p>Organize expenses with custom categories</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          + Add Category
        </button>
      </header>

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div
              className="category-icon"
              style={{ background: category.color }}
            >
              {category.icon}
            </div>
            <div className="category-info">
              <h3>{category.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Category</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="modal-body">
              <div className="form-group">
                <label htmlFor="categoryName">Category Name *</label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Office Supplies"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoryIcon">Icon</label>
                <div className="icon-grid">
                  {categoryIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${newCategory.icon === icon ? 'selected' : ''}`}
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="categoryColor">Color</label>
                <div className="color-grid">
                  {categoryColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${newCategory.color === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                    />
                  ))}
                </div>
              </div>
            </form>
            <div className="modal-footer">
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;