import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  closeThemeBuilder,
  updateBuilderTheme,
  previewBuilderTheme,
  saveCustomTheme,
  stopPreview
} from '@/store/slices/themeSlice';
import { ColorPalette, Typography, ThemeCustomization } from '@/types/theme';
import { themeEngine } from '@/utils/themeEngine';
import './ThemeBuilder.css';

const ThemeBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const { builderTheme, previewMode } = useSelector((state: RootState) => state.theme);

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'components'>('colors');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    return () => {
      if (previewMode) {
        dispatch(stopPreview());
      }
    };
  }, [dispatch, previewMode]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    dispatch(closeThemeBuilder());
  };

  const handlePreview = () => {
    dispatch(previewBuilderTheme());
  };

  const handleSave = () => {
    dispatch(saveCustomTheme());
    setHasUnsavedChanges(false);
  };

  const updateTheme = (updates: Partial<ThemeCustomization>) => {
    dispatch(updateBuilderTheme(updates));
    setHasUnsavedChanges(true);
  };

  const updateColors = (colorUpdates: Partial<ColorPalette>) => {
    if (builderTheme) {
      updateTheme({
        customizations: {
          ...builderTheme.customizations,
          colors: {
            ...builderTheme.customizations.colors,
            ...colorUpdates
          }
        }
      });
    }
  };

  const updateTypography = (typoUpdates: Partial<Typography>) => {
    if (builderTheme) {
      updateTheme({
        customizations: {
          ...builderTheme.customizations,
          typography: {
            ...builderTheme.customizations.typography,
            ...typoUpdates
          }
        }
      });
    }
  };

  if (!builderTheme) {
    return null;
  }

  const baseTheme = themeEngine.getTheme(builderTheme.baseTheme);

  return (
    <div className="theme-builder">
      <div className="theme-builder-header">
        <div className="header-left">
          <h2>Theme Builder</h2>
          <span className="base-theme">Based on: {baseTheme?.name}</span>
        </div>
        <div className="header-right">
          <button className="btn secondary" onClick={handlePreview}>
            {previewMode ? 'Update Preview' : 'Preview'}
          </button>
          <button
            className="btn primary"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            Save Theme
          </button>
          <button className="btn close" onClick={handleClose}>
            ×
          </button>
        </div>
      </div>

      <div className="theme-builder-content">
        <div className="builder-sidebar">
          <div className="theme-info">
            <div className="form-group">
              <label>Theme Name</label>
              <input
                type="text"
                value={builderTheme.name}
                onChange={(e) => updateTheme({ name: e.target.value })}
                placeholder="My Custom Theme"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={builderTheme.description}
                onChange={(e) => updateTheme({ description: e.target.value })}
                placeholder="Describe your theme..."
                rows={3}
              />
            </div>
          </div>

          <div className="builder-tabs">
            {[
              { id: 'colors', label: 'Colors', icon: '🎨' },
              { id: 'typography', label: 'Typography', icon: '📝' },
              { id: 'spacing', label: 'Spacing', icon: '📏' },
              { id: 'components', label: 'Components', icon: '🧩' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`builder-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="builder-main">
          {activeTab === 'colors' && (
            <div className="color-editor">
              <h3>Color Palette</h3>

              <div className="color-section">
                <h4>Primary Colors</h4>
                <div className="color-grid">
                  <div className="color-input-group">
                    <label>Primary</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={builderTheme.customizations.colors?.primary || baseTheme?.colors.primary}
                        onChange={(e) => updateColors({ primary: e.target.value })}
                      />
                      <input
                        type="text"
                        value={builderTheme.customizations.colors?.primary || baseTheme?.colors.primary}
                        onChange={(e) => updateColors({ primary: e.target.value })}
                        placeholder="#007acc"
                      />
                    </div>
                  </div>

                  <div className="color-input-group">
                    <label>Secondary</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={builderTheme.customizations.colors?.secondary || baseTheme?.colors.secondary}
                        onChange={(e) => updateColors({ secondary: e.target.value })}
                      />
                      <input
                        type="text"
                        value={builderTheme.customizations.colors?.secondary || baseTheme?.colors.secondary}
                        onChange={(e) => updateColors({ secondary: e.target.value })}
                        placeholder="#005a9e"
                      />
                    </div>
                  </div>

                  <div className="color-input-group">
                    <label>Accent</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={builderTheme.customizations.colors?.accent || baseTheme?.colors.accent}
                        onChange={(e) => updateColors({ accent: e.target.value })}
                      />
                      <input
                        type="text"
                        value={builderTheme.customizations.colors?.accent || baseTheme?.colors.accent}
                        onChange={(e) => updateColors({ accent: e.target.value })}
                        placeholder="#0078d4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="color-section">
                <h4>Status Colors</h4>
                <div className="color-grid">
                  <div className="color-input-group">
                    <label>Success</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={builderTheme.customizations.colors?.success || baseTheme?.colors.success}
                        onChange={(e) => updateColors({ success: e.target.value })}
                      />
                      <input
                        type="text"
                        value={builderTheme.customizations.colors?.success || baseTheme?.colors.success}
                        onChange={(e) => updateColors({ success: e.target.value })}
                        placeholder="#28a745"
                      />
                    </div>
                  </div>

                  <div className="color-input-group">
                    <label>Warning</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={builderTheme.customizations.colors?.warning || baseTheme?.colors.warning}
                        onChange={(e) => updateColors({ warning: e.target.value })}
                      />
                      <input
                        type="text"
                        value={builderTheme.customizations.colors?.warning || baseTheme?.colors.warning}
                        onChange={(e) => updateColors({ warning: e.target.value })}
                        placeholder="#ffc107"
                      />
                    </div>
                  </div>

                  <div className="color-input-group">
                    <label>Error</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={builderTheme.customizations.colors?.error || baseTheme?.colors.error}
                        onChange={(e) => updateColors({ error: e.target.value })}
                      />
                      <input
                        type="text"
                        value={builderTheme.customizations.colors?.error || baseTheme?.colors.error}
                        onChange={(e) => updateColors({ error: e.target.value })}
                        placeholder="#dc3545"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="color-section">
                <h4>Background Colors</h4>
                <div className="color-grid">
                  <div className="color-input-group">
                    <label>Primary Background</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={builderTheme.customizations.colors?.background?.primary || baseTheme?.colors.background.primary}
                        onChange={(e) => updateColors({
                          background: {
                            ...builderTheme.customizations.colors?.background,
                            primary: e.target.value
                          }
                        })}
                      />
                      <input
                        type="text"
                        value={builderTheme.customizations.colors?.background?.primary || baseTheme?.colors.background.primary}
                        onChange={(e) => updateColors({
                          background: {
                            ...builderTheme.customizations.colors?.background,
                            primary: e.target.value
                          }
                        })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="color-input-group">
                    <label>Secondary Background</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={builderTheme.customizations.colors?.background?.secondary || baseTheme?.colors.background.secondary}
                        onChange={(e) => updateColors({
                          background: {
                            ...builderTheme.customizations.colors?.background,
                            secondary: e.target.value
                          }
                        })}
                      />
                      <input
                        type="text"
                        value={builderTheme.customizations.colors?.background?.secondary || baseTheme?.colors.background.secondary}
                        onChange={(e) => updateColors({
                          background: {
                            ...builderTheme.customizations.colors?.background,
                            secondary: e.target.value
                          }
                        })}
                        placeholder="#f8f9fa"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="typography-editor">
              <h3>Typography</h3>

              <div className="typography-section">
                <h4>Font Families</h4>
                <div className="form-group">
                  <label>Sans-serif</label>
                  <input
                    type="text"
                    value={builderTheme.customizations.typography?.fontFamilies?.sans || baseTheme?.typography.fontFamilies.sans}
                    onChange={(e) => updateTypography({
                      fontFamilies: {
                        ...builderTheme.customizations.typography?.fontFamilies,
                        sans: e.target.value
                      }
                    })}
                    placeholder="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  />
                </div>
                <div className="form-group">
                  <label>Monospace</label>
                  <input
                    type="text"
                    value={builderTheme.customizations.typography?.fontFamilies?.mono || baseTheme?.typography.fontFamilies.mono}
                    onChange={(e) => updateTypography({
                      fontFamilies: {
                        ...builderTheme.customizations.typography?.fontFamilies,
                        mono: e.target.value
                      }
                    })}
                    placeholder="'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
                  />
                </div>
              </div>

              <div className="typography-section">
                <h4>Font Sizes</h4>
                <div className="font-size-grid">
                  {Object.entries(baseTheme?.typography.fontSizes || {}).map(([key, value]) => (
                    <div key={key} className="form-group">
                      <label>{key}</label>
                      <input
                        type="text"
                        value={builderTheme.customizations.typography?.fontSizes?.[key as keyof Typography['fontSizes']] || value}
                        onChange={(e) => updateTypography({
                          fontSizes: {
                            ...builderTheme.customizations.typography?.fontSizes,
                            [key]: e.target.value
                          }
                        })}
                        placeholder={value}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spacing' && (
            <div className="spacing-editor">
              <h3>Spacing</h3>
              <div className="spacing-grid">
                {Object.entries(baseTheme?.spacing || {}).map(([key, value]) => (
                  <div key={key} className="form-group">
                    <label>{key}</label>
                    <input
                      type="text"
                      value={builderTheme.customizations.spacing?.[key as keyof typeof baseTheme.spacing] || value}
                      onChange={(e) => updateTheme({
                        customizations: {
                          ...builderTheme.customizations,
                          spacing: {
                            ...builderTheme.customizations.spacing,
                            [key]: e.target.value
                          }
                        }
                      })}
                      placeholder={value}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="components-editor">
              <h3>Component Styles</h3>
              <div className="component-section">
                <h4>Window</h4>
                <div className="form-group">
                  <label>Background</label>
                  <input
                    type="text"
                    value={builderTheme.customizations.components?.window?.background || baseTheme?.components.window.background}
                    onChange={(e) => updateTheme({
                      customizations: {
                        ...builderTheme.customizations,
                        components: {
                          ...builderTheme.customizations.components,
                          window: {
                            ...builderTheme.customizations.components?.window,
                            background: e.target.value
                          }
                        }
                      }
                    })}
                    placeholder={baseTheme?.components.window.background}
                  />
                </div>
                <div className="form-group">
                  <label>Border</label>
                  <input
                    type="text"
                    value={builderTheme.customizations.components?.window?.border || baseTheme?.components.window.border}
                    onChange={(e) => updateTheme({
                      customizations: {
                        ...builderTheme.customizations,
                        components: {
                          ...builderTheme.customizations.components,
                          window: {
                            ...builderTheme.customizations.components?.window,
                            border: e.target.value
                          }
                        }
                      }
                    })}
                    placeholder={baseTheme?.components.window.border}
                  />
                </div>
                <div className="form-group">
                  <label>Border Radius</label>
                  <input
                    type="text"
                    value={builderTheme.customizations.components?.window?.borderRadius || baseTheme?.components.window.borderRadius}
                    onChange={(e) => updateTheme({
                      customizations: {
                        ...builderTheme.customizations,
                        components: {
                          ...builderTheme.customizations.components,
                          window: {
                            ...builderTheme.customizations.components?.window,
                            borderRadius: e.target.value
                          }
                        }
                      }
                    })}
                    placeholder={baseTheme?.components.window.borderRadius}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeBuilder;