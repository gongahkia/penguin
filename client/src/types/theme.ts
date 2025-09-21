export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };
  border: {
    default: string;
    light: string;
    dark: string;
    focus: string;
  };
  shadow: {
    light: string;
    medium: string;
    dark: string;
    colored: string;
  };
}

export interface Typography {
  fontFamilies: {
    sans: string;
    serif: string;
    mono: string;
    display: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface Animation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
  };
  effects: {
    fadeIn: string;
    slideUp: string;
    slideDown: string;
    slideLeft: string;
    slideRight: string;
    zoom: string;
    rotate: string;
  };
}

export interface ComponentStyles {
  window: {
    background: string;
    border: string;
    borderRadius: string;
    shadow: string;
    header: {
      background: string;
      height: string;
      padding: string;
    };
    controls: {
      size: string;
      spacing: string;
    };
  };
  button: {
    primary: {
      background: string;
      backgroundHover: string;
      text: string;
      border: string;
      borderRadius: string;
      padding: string;
    };
    secondary: {
      background: string;
      backgroundHover: string;
      text: string;
      border: string;
      borderRadius: string;
      padding: string;
    };
  };
  input: {
    background: string;
    backgroundFocus: string;
    text: string;
    border: string;
    borderFocus: string;
    borderRadius: string;
    padding: string;
    placeholder: string;
  };
  taskbar: {
    background: string;
    height: string;
    padding: string;
    border: string;
    shadow: string;
  };
  desktop: {
    background: string;
    iconSpacing: string;
    iconSize: string;
  };
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'light' | 'dark' | 'colorful' | 'minimal' | 'retro' | 'modern' | 'nature' | 'custom';
  tags: string[];
  preview: string; // URL to preview image
  screenshots: string[];

  // Theme data
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  animations: Animation;
  components: ComponentStyles;

  // Additional assets
  wallpaper?: string;
  sounds?: {
    [key: string]: string;
  };
  icons?: {
    [key: string]: string;
  };

  // Metadata
  downloads: number;
  rating: number;
  reviews: number;
  featured: boolean;
  premium: boolean;
  price?: number;
  createdAt: Date;
  updatedAt: Date;

  // Installation
  isInstalled: boolean;
  isActive: boolean;
  installSize: number;
}

export interface ThemeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}

export interface ThemeMarketplace {
  categories: ThemeCategory[];
  featured: ThemeDefinition[];
  popular: ThemeDefinition[];
  recent: ThemeDefinition[];
  installed: ThemeDefinition[];

  // Filters and search
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'name' | 'downloads' | 'rating' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
  showPremiumOnly: boolean;
  showFreeOnly: boolean;
}

export interface ThemeCustomization {
  baseTheme: string;
  customizations: {
    colors?: Partial<ColorPalette>;
    typography?: Partial<Typography>;
    spacing?: Partial<Spacing>;
    borderRadius?: Partial<BorderRadius>;
    animations?: Partial<Animation>;
    components?: Partial<ComponentStyles>;
  };
  name: string;
  description: string;
  preview?: string;
}

export interface ThemeEngine {
  activeTheme: ThemeDefinition | null;
  customTheme: ThemeCustomization | null;
  marketplace: ThemeMarketplace;
  isLoading: boolean;
  error: string | null;

  // Theme builder state
  builderOpen: boolean;
  builderTheme: ThemeCustomization | null;
  previewMode: boolean;
}

export type ThemeAction =
  | 'install'
  | 'uninstall'
  | 'activate'
  | 'deactivate'
  | 'update'
  | 'customize'
  | 'preview'
  | 'purchase'
  | 'rate'
  | 'review';

export interface ThemeActionPayload {
  action: ThemeAction;
  themeId: string;
  data?: any;
}