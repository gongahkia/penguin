import React, { useState, useEffect } from 'react';
import { Plugin, PluginManifest } from '@/types/plugin';
import { pluginManager } from '@/utils/pluginManager';
import './PluginManager.css';

interface PluginManagerProps {
  windowId: string;
}

const PluginManager: React.FC<PluginManagerProps> = ({ windowId }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedTab, setSelectedTab] = useState<'installed' | 'store' | 'develop'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  useEffect(() => {
    loadPlugins();

    const handlePluginEvent = () => {
      loadPlugins();
    };

    pluginManager.addEventListener('plugin-enabled', handlePluginEvent);
    pluginManager.addEventListener('plugin-disabled', handlePluginEvent);
    pluginManager.addEventListener('plugin-uninstalled', handlePluginEvent);

    return () => {
      pluginManager.removeEventListener('plugin-enabled', handlePluginEvent);
      pluginManager.removeEventListener('plugin-disabled', handlePluginEvent);
      pluginManager.removeEventListener('plugin-uninstalled', handlePluginEvent);
    };
  }, []);

  const loadPlugins = () => {
    const installedPlugins = pluginManager.getInstalledPlugins();
    setPlugins(installedPlugins);
  };

  const handlePluginToggle = async (pluginId: string) => {
    setIsLoading(true);
    try {
      const plugin = plugins.find(p => p.manifest.id === pluginId);
      if (plugin?.isEnabled) {
        await pluginManager.disablePlugin(pluginId);
      } else {
        await pluginManager.enablePlugin(pluginId);
      }
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
      alert(`Failed to toggle plugin: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePluginUninstall = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) {
      return;
    }

    setIsLoading(true);
    try {
      await pluginManager.uninstallPlugin(pluginId);
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      alert(`Failed to uninstall plugin: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInstall = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      await pluginManager.installPlugin({ file, autoEnable: true });
      alert('Plugin installed successfully!');
    } catch (error) {
      console.error('Failed to install plugin:', error);
      alert(`Failed to install plugin: ${error}`);
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const filteredPlugins = plugins.filter(plugin =>
    plugin.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.manifest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="plugin-manager">
      <div className="plugin-manager-header">
        <div className="plugin-tabs">
          <button
            className={selectedTab === 'installed' ? 'active' : ''}
            onClick={() => setSelectedTab('installed')}
          >
            Installed ({plugins.length})
          </button>
          <button
            className={selectedTab === 'store' ? 'active' : ''}
            onClick={() => setSelectedTab('store')}
          >
            Plugin Store
          </button>
          <button
            className={selectedTab === 'develop' ? 'active' : ''}
            onClick={() => setSelectedTab('develop')}
          >
            Development
          </button>
        </div>

        <div className="plugin-actions">
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="plugin-content">
        {selectedTab === 'installed' && (
          <div className="installed-plugins">
            {filteredPlugins.length === 0 ? (
              <div className="empty-state">
                <h3>No plugins installed</h3>
                <p>Install plugins from the Plugin Store or upload your own.</p>
              </div>
            ) : (
              <div className="plugin-grid">
                {filteredPlugins.map(plugin => (
                  <PluginCard
                    key={plugin.manifest.id}
                    plugin={plugin}
                    onToggle={handlePluginToggle}
                    onUninstall={handlePluginUninstall}
                    onSelect={setSelectedPlugin}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'store' && (
          <div className="plugin-store">
            <div className="store-categories">
              <button className="category-btn active">All</button>
              <button className="category-btn">Productivity</button>
              <button className="category-btn">Games</button>
              <button className="category-btn">Utilities</button>
              <button className="category-btn">Development</button>
            </div>

            <div className="store-content">
              <div className="coming-soon">
                <h3>Plugin Store Coming Soon</h3>
                <p>Browse and install community-created plugins from our official store.</p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'develop' && (
          <div className="plugin-development">
            <div className="dev-section">
              <h3>Install Plugin from File</h3>
              <p>Upload a plugin file (.js) to install it locally.</p>
              <input
                type="file"
                accept=".js,.ts"
                onChange={handleFileInstall}
                className="file-input"
                disabled={isLoading}
              />
            </div>

            <div className="dev-section">
              <h3>Plugin Development</h3>
              <p>Learn how to create your own plugins for Penguin OS.</p>
              <div className="dev-links">
                <button className="dev-link">Documentation</button>
                <button className="dev-link">API Reference</button>
                <button className="dev-link">Examples</button>
                <button className="dev-link">Plugin Template</button>
              </div>
            </div>

            <div className="dev-section">
              <h3>Debug Console</h3>
              <textarea
                className="debug-console"
                placeholder="Plugin debug output will appear here..."
                readOnly
                rows={10}
              />
            </div>
          </div>
        )}
      </div>

      {selectedPlugin && (
        <PluginDetails
          plugin={selectedPlugin}
          onClose={() => setSelectedPlugin(null)}
          onToggle={handlePluginToggle}
          onUninstall={handlePluginUninstall}
        />
      )}
    </div>
  );
};

interface PluginCardProps {
  plugin: Plugin;
  onToggle: (pluginId: string) => void;
  onUninstall: (pluginId: string) => void;
  onSelect: (plugin: Plugin) => void;
  isLoading: boolean;
}

const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  onToggle,
  onUninstall,
  onSelect,
  isLoading
}) => {
  return (
    <div className={`plugin-card ${plugin.isEnabled ? 'enabled' : 'disabled'}`}>
      <div className="plugin-icon">
        {plugin.manifest.icon || '🧩'}
      </div>

      <div className="plugin-info">
        <h4 className="plugin-name">{plugin.manifest.name}</h4>
        <p className="plugin-description">{plugin.manifest.description}</p>
        <div className="plugin-meta">
          <span className="plugin-version">v{plugin.manifest.version}</span>
          <span className="plugin-author">by {plugin.manifest.author}</span>
        </div>
      </div>

      <div className="plugin-actions">
        <button
          className={`toggle-btn ${plugin.isEnabled ? 'enabled' : 'disabled'}`}
          onClick={() => onToggle(plugin.manifest.id)}
          disabled={isLoading}
        >
          {plugin.isEnabled ? 'Disable' : 'Enable'}
        </button>

        <button
          className="action-btn"
          onClick={() => onSelect(plugin)}
        >
          Details
        </button>

        <button
          className="action-btn danger"
          onClick={() => onUninstall(plugin.manifest.id)}
          disabled={isLoading}
        >
          Uninstall
        </button>
      </div>

      <div className={`plugin-status ${plugin.isEnabled ? 'enabled' : 'disabled'}`}>
        {plugin.isEnabled ? 'Enabled' : 'Disabled'}
      </div>
    </div>
  );
};

interface PluginDetailsProps {
  plugin: Plugin;
  onClose: () => void;
  onToggle: (pluginId: string) => void;
  onUninstall: (pluginId: string) => void;
}

const PluginDetails: React.FC<PluginDetailsProps> = ({
  plugin,
  onClose,
  onToggle,
  onUninstall
}) => {
  return (
    <div className="plugin-details-overlay">
      <div className="plugin-details">
        <div className="details-header">
          <h2>{plugin.manifest.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="details-content">
          <div className="details-main">
            <div className="plugin-icon-large">
              {plugin.manifest.icon || '🧩'}
            </div>

            <div className="plugin-info-detailed">
              <p className="description">{plugin.manifest.description}</p>

              <div className="metadata">
                <div className="meta-item">
                  <label>Version:</label>
                  <span>{plugin.manifest.version}</span>
                </div>
                <div className="meta-item">
                  <label>Author:</label>
                  <span>{plugin.manifest.author}</span>
                </div>
                <div className="meta-item">
                  <label>Status:</label>
                  <span className={plugin.isEnabled ? 'enabled' : 'disabled'}>
                    {plugin.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {plugin.manifest.permissions && plugin.manifest.permissions.length > 0 && (
                <div className="permissions">
                  <h4>Permissions Required:</h4>
                  <ul>
                    {plugin.manifest.permissions.map((permission, index) => (
                      <li key={index}>
                        <strong>{permission.type}:</strong> {permission.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="details-actions">
            <button
              className={`action-btn primary ${plugin.isEnabled ? 'enabled' : 'disabled'}`}
              onClick={() => onToggle(plugin.manifest.id)}
            >
              {plugin.isEnabled ? 'Disable' : 'Enable'}
            </button>

            <button
              className="action-btn danger"
              onClick={() => {
                onUninstall(plugin.manifest.id);
                onClose();
              }}
            >
              Uninstall
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginManager;