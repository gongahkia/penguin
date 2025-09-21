import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  loadMarketplace,
  loadMarketplaceSuccess,
  setSearchQuery,
  setSelectedCategory,
  activateTheme,
  installTheme,
  uninstallTheme,
  startPreview,
  stopPreview,
  openThemeBuilder,
  rateTheme,
  downloadTheme,
  clearError
} from '@/store/slices/themeSlice';
import { ThemeDefinition } from '@/types/theme';
import { themeEngine } from '@/utils/themeEngine';
import './ThemeMarketplace.css';

const ThemeMarketplace: React.FC = () => {
  const dispatch = useDispatch();
  const {
    marketplace,
    activeTheme,
    isLoading,
    error,
    previewMode,
    previewTheme
  } = useSelector((state: RootState) => state.theme);

  const [selectedTheme, setSelectedTheme] = useState<ThemeDefinition | null>(null);
  const [activeTab, setActiveTab] = useState<'featured' | 'popular' | 'recent' | 'installed'>('featured');

  useEffect(() => {
    dispatch(loadMarketplace());
    // Simulate loading marketplace data
    setTimeout(() => {
      const allThemes = themeEngine.getAllThemes();
      dispatch(loadMarketplaceSuccess({
        featured: allThemes.filter(t => t.featured),
        popular: allThemes.sort((a, b) => b.downloads - a.downloads).slice(0, 10),
        recent: allThemes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 10)
      }));
    }, 1000);
  }, [dispatch]);

  const getThemesToShow = (): ThemeDefinition[] => {
    let themes: ThemeDefinition[] = [];

    switch (activeTab) {
      case 'featured':
        themes = marketplace.featured;
        break;
      case 'popular':
        themes = marketplace.popular;
        break;
      case 'recent':
        themes = marketplace.recent;
        break;
      case 'installed':
        themes = marketplace.installed;
        break;
    }

    // Apply filters
    if (marketplace.selectedCategory && marketplace.selectedCategory !== 'all') {
      themes = themes.filter(theme => theme.category === marketplace.selectedCategory);
    }

    if (marketplace.searchQuery) {
      const query = marketplace.searchQuery.toLowerCase();
      themes = themes.filter(theme =>
        theme.name.toLowerCase().includes(query) ||
        theme.description.toLowerCase().includes(query) ||
        theme.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (marketplace.showPremiumOnly) {
      themes = themes.filter(theme => theme.premium);
    }

    if (marketplace.showFreeOnly) {
      themes = themes.filter(theme => !theme.premium);
    }

    // Apply sorting
    themes.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (marketplace.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'downloads':
          aValue = a.downloads;
          bValue = b.downloads;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'date':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'size':
          aValue = a.installSize;
          bValue = b.installSize;
          break;
        default:
          return 0;
      }

      if (marketplace.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return themes;
  };

  const handleThemeAction = (theme: ThemeDefinition, action: string) => {
    switch (action) {
      case 'preview':
        dispatch(startPreview(theme.id));
        break;
      case 'install':
        dispatch(installTheme(theme));
        dispatch(downloadTheme(theme.id));
        break;
      case 'uninstall':
        dispatch(uninstallTheme(theme.id));
        break;
      case 'activate':
        dispatch(activateTheme(theme.id));
        break;
      case 'customize':
        dispatch(openThemeBuilder(theme.id));
        break;
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`star ${i < rating ? 'filled' : ''}`}
        onClick={() => selectedTheme && dispatch(rateTheme({ themeId: selectedTheme.id, rating: i + 1 }))}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="theme-marketplace">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())}>×</button>
        </div>
      )}

      {previewMode && previewTheme && (
        <div className="preview-banner">
          <span>Previewing: {previewTheme.name}</span>
          <div className="preview-actions">
            <button
              className="btn primary"
              onClick={() => dispatch(activateTheme(previewTheme.id))}
            >
              Apply Theme
            </button>
            <button
              className="btn secondary"
              onClick={() => dispatch(stopPreview())}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="marketplace-header">
        <h1>Theme Marketplace</h1>
        <div className="marketplace-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search themes..."
              value={marketplace.searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            />
          </div>
          <button
            className="btn primary"
            onClick={() => dispatch(openThemeBuilder(null))}
          >
            Create Theme
          </button>
        </div>
      </div>

      <div className="marketplace-content">
        <div className="sidebar">
          <div className="categories">
            <h3>Categories</h3>
            <div className="category-list">
              {marketplace.categories.map(category => (
                <button
                  key={category.id}
                  className={`category-item ${marketplace.selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => dispatch(setSelectedCategory(category.id === 'all' ? null : category.id))}
                >
                  <span className="category-icon">{category.icon}</span>
                  <div className="category-info">
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">{category.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="filters">
            <h3>Filters</h3>
            <div className="filter-options">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={marketplace.showFreeOnly}
                  onChange={() => dispatch({ type: 'theme/toggleFreeFilter' })}
                />
                Free Only
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={marketplace.showPremiumOnly}
                  onChange={() => dispatch({ type: 'theme/togglePremiumFilter' })}
                />
                Premium Only
              </label>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="content-tabs">
            {['featured', 'popular', 'recent', 'installed'].map(tab => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="content-controls">
            <div className="sort-controls">
              <label>
                Sort by:
                <select
                  value={marketplace.sortBy}
                  onChange={(e) => dispatch({ type: 'theme/setSortBy', payload: e.target.value })}
                >
                  <option value="name">Name</option>
                  <option value="downloads">Downloads</option>
                  <option value="rating">Rating</option>
                  <option value="date">Date</option>
                  <option value="size">Size</option>
                </select>
              </label>
              <button
                className="sort-order"
                onClick={() => dispatch({ type: 'theme/setSortOrder', payload: marketplace.sortOrder === 'asc' ? 'desc' : 'asc' })}
              >
                {marketplace.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading">Loading themes...</div>
          ) : (
            <div className="theme-grid">
              {getThemesToShow().map(theme => (
                <div
                  key={theme.id}
                  className={`theme-card ${theme.isActive ? 'active' : ''} ${selectedTheme?.id === theme.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTheme(theme)}
                >
                  <div className="theme-preview">
                    <img src={theme.preview} alt={theme.name} />
                    {theme.premium && <span className="premium-badge">Premium</span>}
                    {theme.featured && <span className="featured-badge">Featured</span>}
                  </div>

                  <div className="theme-info">
                    <h4 className="theme-name">{theme.name}</h4>
                    <p className="theme-author">by {theme.author}</p>
                    <p className="theme-description">{theme.description}</p>

                    <div className="theme-stats">
                      <div className="rating">
                        {renderStars(Math.round(theme.rating))}
                        <span>({theme.reviews})</span>
                      </div>
                      <div className="downloads">
                        {theme.downloads.toLocaleString()} downloads
                      </div>
                      <div className="size">
                        {formatFileSize(theme.installSize)}
                      </div>
                    </div>

                    <div className="theme-tags">
                      {theme.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>

                    <div className="theme-actions">
                      {!theme.isInstalled ? (
                        <>
                          <button
                            className="btn secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleThemeAction(theme, 'preview');
                            }}
                          >
                            Preview
                          </button>
                          <button
                            className="btn primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleThemeAction(theme, 'install');
                            }}
                          >
                            {theme.premium && theme.price ? `$${theme.price}` : 'Install'}
                          </button>
                        </>
                      ) : (
                        <>
                          {!theme.isActive ? (
                            <button
                              className="btn primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleThemeAction(theme, 'activate');
                              }}
                            >
                              Activate
                            </button>
                          ) : (
                            <span className="active-badge">Active</span>
                          )}
                          <button
                            className="btn secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleThemeAction(theme, 'customize');
                            }}
                          >
                            Customize
                          </button>
                          {!theme.id.startsWith('default-') && (
                            <button
                              className="btn danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleThemeAction(theme, 'uninstall');
                              }}
                            >
                              Uninstall
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeMarketplace;