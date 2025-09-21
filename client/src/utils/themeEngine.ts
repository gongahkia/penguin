import { ThemeDefinition, ColorPalette, Typography, ThemeCustomization } from '@/types/theme';

// Predefined themes
const defaultThemes: ThemeDefinition[] = [
  {
    id: 'default-dark',
    name: 'Penguin Dark',
    description: 'The classic dark theme for Penguin OS',
    version: '1.0.0',
    author: 'Penguin OS Team',
    category: 'dark',
    tags: ['default', 'dark', 'professional'],
    preview: '/themes/previews/default-dark.png',
    screenshots: ['/themes/screenshots/default-dark-1.png'],
    colors: {
      primary: '#007acc',
      secondary: '#005a9e',
      tertiary: '#003d6b',
      accent: '#0078d4',
      success: '#107c10',
      warning: '#ffb900',
      error: '#d13438',
      info: '#00bcf2',
      background: {
        primary: '#1e1e1e',
        secondary: '#2d2d2d',
        tertiary: '#3c3c3c',
        elevated: '#404040'
      },
      text: {
        primary: '#ffffff',
        secondary: '#cccccc',
        tertiary: '#999999',
        inverse: '#000000',
        disabled: '#666666'
      },
      border: {
        default: '#4d4d4d',
        light: '#666666',
        dark: '#333333',
        focus: '#0078d4'
      },
      shadow: {
        light: 'rgba(0, 0, 0, 0.1)',
        medium: 'rgba(0, 0, 0, 0.2)',
        dark: 'rgba(0, 0, 0, 0.3)',
        colored: 'rgba(0, 120, 212, 0.2)'
      }
    },
    typography: {
      fontFamilies: {
        sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        serif: 'Georgia, "Times New Roman", serif',
        mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
        display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
      },
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px'
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: {
        fadeIn: 'fadeIn 300ms ease-in-out',
        slideUp: 'slideUp 300ms ease-out',
        slideDown: 'slideDown 300ms ease-out',
        slideLeft: 'slideLeft 300ms ease-out',
        slideRight: 'slideRight 300ms ease-out',
        zoom: 'zoom 200ms ease-in-out',
        rotate: 'rotate 500ms linear'
      }
    },
    components: {
      window: {
        background: '#2d2d2d',
        border: '1px solid #4d4d4d',
        borderRadius: '8px',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        header: {
          background: '#3c3c3c',
          height: '32px',
          padding: '0 8px'
        },
        controls: {
          size: '16px',
          spacing: '4px'
        }
      },
      button: {
        primary: {
          background: '#0078d4',
          backgroundHover: '#106ebe',
          text: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px'
        },
        secondary: {
          background: '#3c3c3c',
          backgroundHover: '#4d4d4d',
          text: '#ffffff',
          border: '1px solid #4d4d4d',
          borderRadius: '4px',
          padding: '8px 16px'
        }
      },
      input: {
        background: '#404040',
        backgroundFocus: '#4d4d4d',
        text: '#ffffff',
        border: '1px solid #666666',
        borderFocus: '1px solid #0078d4',
        borderRadius: '4px',
        padding: '8px 12px',
        placeholder: '#999999'
      },
      taskbar: {
        background: '#2d2d2d',
        height: '48px',
        padding: '8px 16px',
        border: '1px solid #4d4d4d',
        shadow: '0 -2px 8px rgba(0, 0, 0, 0.2)'
      },
      desktop: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        iconSpacing: '16px',
        iconSize: '64px'
      }
    },
    downloads: 0,
    rating: 5.0,
    reviews: 0,
    featured: true,
    premium: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    isInstalled: true,
    isActive: true,
    installSize: 25600
  },
  {
    id: 'default-light',
    name: 'Penguin Light',
    description: 'A clean and bright theme for Penguin OS',
    version: '1.0.0',
    author: 'Penguin OS Team',
    category: 'light',
    tags: ['default', 'light', 'clean'],
    preview: '/themes/previews/default-light.png',
    screenshots: ['/themes/screenshots/default-light-1.png'],
    colors: {
      primary: '#0078d4',
      secondary: '#106ebe',
      tertiary: '#005a9e',
      accent: '#0078d4',
      success: '#107c10',
      warning: '#ffb900',
      error: '#d13438',
      info: '#00bcf2',
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        tertiary: '#e9ecef',
        elevated: '#ffffff'
      },
      text: {
        primary: '#212529',
        secondary: '#495057',
        tertiary: '#6c757d',
        inverse: '#ffffff',
        disabled: '#adb5bd'
      },
      border: {
        default: '#dee2e6',
        light: '#e9ecef',
        dark: '#adb5bd',
        focus: '#0078d4'
      },
      shadow: {
        light: 'rgba(0, 0, 0, 0.05)',
        medium: 'rgba(0, 0, 0, 0.1)',
        dark: 'rgba(0, 0, 0, 0.15)',
        colored: 'rgba(0, 120, 212, 0.1)'
      }
    },
    typography: {
      fontFamilies: {
        sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        serif: 'Georgia, "Times New Roman", serif',
        mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
        display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
      },
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px'
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: {
        fadeIn: 'fadeIn 300ms ease-in-out',
        slideUp: 'slideUp 300ms ease-out',
        slideDown: 'slideDown 300ms ease-out',
        slideLeft: 'slideLeft 300ms ease-out',
        slideRight: 'slideRight 300ms ease-out',
        zoom: 'zoom 200ms ease-in-out',
        rotate: 'rotate 500ms linear'
      }
    },
    components: {
      window: {
        background: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        header: {
          background: '#f8f9fa',
          height: '32px',
          padding: '0 8px'
        },
        controls: {
          size: '16px',
          spacing: '4px'
        }
      },
      button: {
        primary: {
          background: '#0078d4',
          backgroundHover: '#106ebe',
          text: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px'
        },
        secondary: {
          background: '#f8f9fa',
          backgroundHover: '#e9ecef',
          text: '#212529',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '8px 16px'
        }
      },
      input: {
        background: '#ffffff',
        backgroundFocus: '#ffffff',
        text: '#212529',
        border: '1px solid #ced4da',
        borderFocus: '1px solid #0078d4',
        borderRadius: '4px',
        padding: '8px 12px',
        placeholder: '#6c757d'
      },
      taskbar: {
        background: '#ffffff',
        height: '48px',
        padding: '8px 16px',
        border: '1px solid #dee2e6',
        shadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
      },
      desktop: {
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        iconSpacing: '16px',
        iconSize: '64px'
      }
    },
    downloads: 0,
    rating: 4.8,
    reviews: 0,
    featured: true,
    premium: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    isInstalled: true,
    isActive: false,
    installSize: 24800
  }
];

export class ThemeEngine {
  private themes: Map<string, ThemeDefinition> = new Map();
  private activeTheme: ThemeDefinition | null = null;

  constructor() {
    this.initializeDefaultThemes();
  }

  private initializeDefaultThemes(): void {
    defaultThemes.forEach(theme => {
      this.themes.set(theme.id, theme);
    });
    this.activeTheme = defaultThemes[0];
  }

  getTheme(id: string): ThemeDefinition | null {
    return this.themes.get(id) || null;
  }

  getAllThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  getInstalledThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values()).filter(theme => theme.isInstalled);
  }

  getFeaturedThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values()).filter(theme => theme.featured);
  }

  getThemesByCategory(category: string): ThemeDefinition[] {
    return Array.from(this.themes.values()).filter(theme => theme.category === category);
  }

  searchThemes(query: string): ThemeDefinition[] {
    const searchLower = query.toLowerCase();
    return Array.from(this.themes.values()).filter(theme =>
      theme.name.toLowerCase().includes(searchLower) ||
      theme.description.toLowerCase().includes(searchLower) ||
      theme.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      theme.author.toLowerCase().includes(searchLower)
    );
  }

  activateTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    if (!theme || !theme.isInstalled) {
      return false;
    }

    // Deactivate current theme
    if (this.activeTheme) {
      this.activeTheme.isActive = false;
    }

    // Activate new theme
    theme.isActive = true;
    this.activeTheme = theme;

    // Apply theme to DOM
    this.applyThemeToDOM(theme);

    return true;
  }

  private applyThemeToDOM(theme: ThemeDefinition): void {
    const root = document.documentElement;

    // Apply color palette
    Object.entries(theme.colors).forEach(([category, colors]) => {
      if (typeof colors === 'object') {
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${category}-${key}`, value);
        });
      } else {
        root.style.setProperty(`--color-${category}`, colors);
      }
    });

    // Apply typography
    Object.entries(theme.typography.fontFamilies).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    Object.entries(theme.typography.fontSizes).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });

    Object.entries(theme.typography.fontWeights).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });

    // Apply spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Apply animation durations
    Object.entries(theme.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });

    // Apply component styles
    this.applyComponentStyles(theme.components);

    // Set theme class on body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.category}`);
    document.body.classList.add(`theme-${theme.id}`);
  }

  private applyComponentStyles(components: any): void {
    const root = document.documentElement;

    const flattenObject = (obj: any, prefix = '--'): any => {
      let result: any = {};
      for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          Object.assign(result, flattenObject(obj[key], `${prefix}${key}-`));
        } else {
          result[`${prefix}${key}`] = obj[key];
        }
      }
      return result;
    };

    const flatStyles = flattenObject(components, '--component-');
    Object.entries(flatStyles).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
  }

  installTheme(theme: ThemeDefinition): boolean {
    if (this.themes.has(theme.id)) {
      // Theme already exists, update it
      const existingTheme = this.themes.get(theme.id)!;
      existingTheme.isInstalled = true;
      existingTheme.updatedAt = new Date();
      return true;
    }

    // Add new theme
    theme.isInstalled = true;
    theme.createdAt = new Date();
    theme.updatedAt = new Date();
    this.themes.set(theme.id, theme);
    return true;
  }

  uninstallTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    if (!theme) return false;

    // Cannot uninstall default themes
    if (theme.id.startsWith('default-')) return false;

    // Cannot uninstall active theme
    if (theme.isActive) return false;

    this.themes.delete(themeId);
    return true;
  }

  exportTheme(themeId: string): string | null {
    const theme = this.themes.get(themeId);
    if (!theme) return null;

    return JSON.stringify(theme, null, 2);
  }

  importTheme(themeData: string): boolean {
    try {
      const theme: ThemeDefinition = JSON.parse(themeData);

      // Validate theme structure
      if (!this.validateTheme(theme)) {
        return false;
      }

      return this.installTheme(theme);
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }

  private validateTheme(theme: any): boolean {
    const requiredFields = ['id', 'name', 'version', 'author', 'category', 'colors', 'typography'];
    return requiredFields.every(field => field in theme);
  }

  generateCSS(theme: ThemeDefinition): string {
    let css = `:root {\n`;

    // Colors
    Object.entries(theme.colors).forEach(([category, colors]) => {
      if (typeof colors === 'object') {
        Object.entries(colors).forEach(([key, value]) => {
          css += `  --color-${category}-${key}: ${value};\n`;
        });
      } else {
        css += `  --color-${category}: ${colors};\n`;
      }
    });

    // Typography
    Object.entries(theme.typography.fontFamilies).forEach(([key, value]) => {
      css += `  --font-${key}: ${value};\n`;
    });

    Object.entries(theme.typography.fontSizes).forEach(([key, value]) => {
      css += `  --text-${key}: ${value};\n`;
    });

    css += `}\n`;

    return css;
  }

  createCustomTheme(baseThemeId: string, customizations: any, name: string): ThemeDefinition | null {
    const baseTheme = this.themes.get(baseThemeId);
    if (!baseTheme) return null;

    const customTheme: ThemeDefinition = {
      ...baseTheme,
      id: `custom-${Date.now()}`,
      name,
      description: `Custom theme based on ${baseTheme.name}`,
      author: 'User',
      category: 'custom',
      tags: ['custom', ...baseTheme.tags],
      premium: false,
      featured: false,
      downloads: 0,
      rating: 0,
      reviews: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isInstalled: true,
      isActive: false
    };

    // Apply customizations
    if (customizations.colors) {
      customTheme.colors = { ...customTheme.colors, ...customizations.colors };
    }
    if (customizations.typography) {
      customTheme.typography = { ...customTheme.typography, ...customizations.typography };
    }
    if (customizations.spacing) {
      customTheme.spacing = { ...customTheme.spacing, ...customizations.spacing };
    }
    if (customizations.components) {
      customTheme.components = { ...customTheme.components, ...customizations.components };
    }

    this.themes.set(customTheme.id, customTheme);
    return customTheme;
  }

  getActiveTheme(): ThemeDefinition | null {
    return this.activeTheme;
  }

  previewTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (theme) {
      this.applyThemeToDOM(theme);
    }
  }

  restoreActiveTheme(): void {
    if (this.activeTheme) {
      this.applyThemeToDOM(this.activeTheme);
    }
  }
}

export const themeEngine = new ThemeEngine();