import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeDefinition, ThemeEngine, ThemeMarketplace, ThemeCustomization, ThemeCategory } from '@/types/theme';
import { themeEngine } from '@/utils/themeEngine';

interface ThemeSliceState {
  activeTheme: ThemeDefinition | null;
  customTheme: ThemeCustomization | null;
  marketplace: ThemeMarketplace;
  isLoading: boolean;
  error: string | null;

  // Theme builder state
  builderOpen: boolean;
  builderTheme: ThemeCustomization | null;
  previewMode: boolean;
  previewTheme: ThemeDefinition | null;
}

const defaultCategories: ThemeCategory[] = [
  {
    id: 'all',
    name: 'All Themes',
    description: 'Browse all available themes',
    icon: '🎨',
    color: '#007acc',
    count: 0
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Bright and clean themes',
    icon: '☀️',
    color: '#ffd700',
    count: 0
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark and professional themes',
    icon: '🌙',
    color: '#2d3748',
    count: 0
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Vibrant and expressive themes',
    icon: '🌈',
    color: '#ff6b6b',
    count: 0
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple themes',
    icon: '⚪',
    color: '#718096',
    count: 0
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Classic and vintage themes',
    icon: '📺',
    color: '#8b5cf6',
    count: 0
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary and stylish themes',
    icon: '✨',
    color: '#06b6d4',
    count: 0
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Earth tones and natural themes',
    icon: '🌿',
    color: '#10b981',
    count: 0
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'User-created themes',
    icon: '🛠️',
    color: '#f59e0b',
    count: 0
  }
];

const initialMarketplace: ThemeMarketplace = {
  categories: defaultCategories,
  featured: [],
  popular: [],
  recent: [],
  installed: [],
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'name',
  sortOrder: 'asc',
  showPremiumOnly: false,
  showFreeOnly: false
};

const initialState: ThemeSliceState = {
  activeTheme: themeEngine.getActiveTheme(),
  customTheme: null,
  marketplace: initialMarketplace,
  isLoading: false,
  error: null,
  builderOpen: false,
  builderTheme: null,
  previewMode: false,
  previewTheme: null
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // Theme activation
    activateTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      const success = themeEngine.activateTheme(themeId);

      if (success) {
        state.activeTheme = themeEngine.getActiveTheme();
        state.error = null;
      } else {
        state.error = `Failed to activate theme: ${themeId}`;
      }
    },

    // Theme installation
    installTheme: (state, action: PayloadAction<ThemeDefinition>) => {
      const theme = action.payload;
      const success = themeEngine.installTheme(theme);

      if (success) {
        state.marketplace.installed = themeEngine.getInstalledThemes();
        state.error = null;
      } else {
        state.error = `Failed to install theme: ${theme.name}`;
      }
    },

    uninstallTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      const success = themeEngine.uninstallTheme(themeId);

      if (success) {
        state.marketplace.installed = themeEngine.getInstalledThemes();
        state.error = null;
      } else {
        state.error = `Failed to uninstall theme: ${themeId}`;
      }
    },

    // Marketplace management
    loadMarketplace: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    loadMarketplaceSuccess: (state, action: PayloadAction<{
      featured: ThemeDefinition[];
      popular: ThemeDefinition[];
      recent: ThemeDefinition[];
    }>) => {
      state.isLoading = false;
      state.marketplace.featured = action.payload.featured;
      state.marketplace.popular = action.payload.popular;
      state.marketplace.recent = action.payload.recent;
      state.marketplace.installed = themeEngine.getInstalledThemes();

      // Update category counts
      const allThemes = [
        ...action.payload.featured,
        ...action.payload.popular,
        ...action.payload.recent
      ];

      state.marketplace.categories = state.marketplace.categories.map(category => ({
        ...category,
        count: category.id === 'all'
          ? allThemes.length
          : allThemes.filter(theme => theme.category === category.id).length
      }));
    },

    loadMarketplaceError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Search and filtering
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.marketplace.searchQuery = action.payload;
    },

    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.marketplace.selectedCategory = action.payload;
    },

    setSortBy: (state, action: PayloadAction<ThemeMarketplace['sortBy']>) => {
      state.marketplace.sortBy = action.payload;
    },

    setSortOrder: (state, action: PayloadAction<ThemeMarketplace['sortOrder']>) => {
      state.marketplace.sortOrder = action.payload;
    },

    togglePremiumFilter: (state) => {
      state.marketplace.showPremiumOnly = !state.marketplace.showPremiumOnly;
      if (state.marketplace.showPremiumOnly) {
        state.marketplace.showFreeOnly = false;
      }
    },

    toggleFreeFilter: (state) => {
      state.marketplace.showFreeOnly = !state.marketplace.showFreeOnly;
      if (state.marketplace.showFreeOnly) {
        state.marketplace.showPremiumOnly = false;
      }
    },

    clearFilters: (state) => {
      state.marketplace.searchQuery = '';
      state.marketplace.selectedCategory = null;
      state.marketplace.sortBy = 'name';
      state.marketplace.sortOrder = 'asc';
      state.marketplace.showPremiumOnly = false;
      state.marketplace.showFreeOnly = false;
    },

    // Theme preview
    startPreview: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      const theme = themeEngine.getTheme(themeId);

      if (theme) {
        state.previewMode = true;
        state.previewTheme = theme;
        themeEngine.previewTheme(themeId);
      }
    },

    stopPreview: (state) => {
      state.previewMode = false;
      state.previewTheme = null;
      themeEngine.restoreActiveTheme();
    },

    // Theme builder
    openThemeBuilder: (state, action: PayloadAction<string | null>) => {
      const baseThemeId = action.payload;
      state.builderOpen = true;

      if (baseThemeId) {
        const baseTheme = themeEngine.getTheme(baseThemeId);
        if (baseTheme) {
          state.builderTheme = {
            baseTheme: baseThemeId,
            customizations: {},
            name: `Custom ${baseTheme.name}`,
            description: `Customized version of ${baseTheme.name}`,
          };
        }
      } else {
        state.builderTheme = {
          baseTheme: 'default-dark',
          customizations: {},
          name: 'My Custom Theme',
          description: 'A custom theme created by me',
        };
      }
    },

    closeThemeBuilder: (state) => {
      state.builderOpen = false;
      state.builderTheme = null;
      if (state.previewMode) {
        themeEngine.restoreActiveTheme();
        state.previewMode = false;
        state.previewTheme = null;
      }
    },

    updateBuilderTheme: (state, action: PayloadAction<Partial<ThemeCustomization>>) => {
      if (state.builderTheme) {
        state.builderTheme = { ...state.builderTheme, ...action.payload };
      }
    },

    previewBuilderTheme: (state) => {
      if (state.builderTheme) {
        // Create temporary theme for preview
        const customTheme = themeEngine.createCustomTheme(
          state.builderTheme.baseTheme,
          state.builderTheme.customizations,
          state.builderTheme.name
        );

        if (customTheme) {
          state.previewMode = true;
          state.previewTheme = customTheme;
          themeEngine.previewTheme(customTheme.id);
        }
      }
    },

    saveCustomTheme: (state) => {
      if (state.builderTheme) {
        const customTheme = themeEngine.createCustomTheme(
          state.builderTheme.baseTheme,
          state.builderTheme.customizations,
          state.builderTheme.name
        );

        if (customTheme) {
          state.customTheme = state.builderTheme;
          state.marketplace.installed = themeEngine.getInstalledThemes();
          state.error = null;
        } else {
          state.error = 'Failed to create custom theme';
        }
      }
    },

    // Theme import/export
    exportTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      const themeData = themeEngine.exportTheme(themeId);

      if (themeData) {
        // In a real app, this would trigger a download
        console.log('Theme exported:', themeData);
      } else {
        state.error = `Failed to export theme: ${themeId}`;
      }
    },

    importTheme: (state, action: PayloadAction<string>) => {
      const themeData = action.payload;
      const success = themeEngine.importTheme(themeData);

      if (success) {
        state.marketplace.installed = themeEngine.getInstalledThemes();
        state.error = null;
      } else {
        state.error = 'Failed to import theme: Invalid theme data';
      }
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    // Theme rating and reviews
    rateTheme: (state, action: PayloadAction<{ themeId: string; rating: number }>) => {
      const { themeId, rating } = action.payload;
      const theme = themeEngine.getTheme(themeId);

      if (theme) {
        // In a real app, this would send to server
        // For now, just update locally
        theme.rating = Math.min(5, Math.max(1, rating));
        state.error = null;
      }
    },

    downloadTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;
      const theme = themeEngine.getTheme(themeId);

      if (theme) {
        theme.downloads += 1;
      }
    },
  },
});

export const {
  activateTheme,
  installTheme,
  uninstallTheme,
  loadMarketplace,
  loadMarketplaceSuccess,
  loadMarketplaceError,
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setSortOrder,
  togglePremiumFilter,
  toggleFreeFilter,
  clearFilters,
  startPreview,
  stopPreview,
  openThemeBuilder,
  closeThemeBuilder,
  updateBuilderTheme,
  previewBuilderTheme,
  saveCustomTheme,
  exportTheme,
  importTheme,
  clearError,
  rateTheme,
  downloadTheme,
} = themeSlice.actions;

export default themeSlice.reducer;