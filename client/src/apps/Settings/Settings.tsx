import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setTheme, toggleSound, toggleAnimations, setFontSize, resetPreferences } from '@/store/slices/userSlice';
import { Monitor, Volume2, VolumeX, Type, RotateCcw } from 'lucide-react';
import './Settings.css';

interface SettingsProps {
  windowId: string;
}

const Settings: React.FC<SettingsProps> = ({ windowId }) => {
  const dispatch = useDispatch();
  const { preferences } = useSelector((state: RootState) => state.user);
  const { uptime, currentUser } = useSelector((state: RootState) => state.system);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>System Settings</h2>
        <p>Configure your Penguin OS experience</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-header">
            <Monitor size={20} />
            <h3>Appearance</h3>
          </div>
          
          <div className="setting-item">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={preferences.theme}
              onChange={(e) => dispatch(setTheme(e.target.value as any))}
              className="setting-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="setting-item">
            <label htmlFor="fontSize">Font Size</label>
            <div className="font-size-control">
              <input
                type="range"
                id="fontSize"
                min="8"
                max="32"
                value={preferences.fontSize}
                onChange={(e) => dispatch(setFontSize(parseInt(e.target.value)))}
                className="setting-slider"
              />
              <span className="font-size-value">{preferences.fontSize}px</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-toggle">
              <label>
                <span>Enable Animations</span>
                <input
                  type="checkbox"
                  checked={preferences.animationsEnabled}
                  onChange={() => dispatch(toggleAnimations())}
                  className="setting-checkbox"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            {preferences.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <h3>Audio</h3>
          </div>
          
          <div className="setting-item">
            <div className="setting-toggle">
              <label>
                <span>System Sounds</span>
                <input
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={() => dispatch(toggleSound())}
                  className="setting-checkbox"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <Type size={20} />
            <h3>Terminal</h3>
          </div>
          
          <div className="setting-item">
            <label htmlFor="terminalTheme">Terminal Theme</label>
            <select
              id="terminalTheme"
              value={preferences.terminalTheme}
              onChange={(e) => dispatch({ type: 'user/setTerminalTheme', payload: e.target.value })}
              className="setting-select"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="matrix">Matrix</option>
              <option value="retro">Retro</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <RotateCcw size={20} />
            <h3>Reset</h3>
          </div>
          
          <div className="setting-item">
            <button
              className="reset-btn"
              onClick={() => {
                if (confirm('Reset all settings to defaults?')) {
                  dispatch(resetPreferences());
                }
              }}
            >
              Reset to Defaults
            </button>
            <p className="setting-description">
              This will reset all preferences to their default values.
            </p>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h3>System Information</h3>
          </div>
          
          <div className="system-info">
            <div className="info-row">
              <span className="info-label">Operating System:</span>
              <span className="info-value">Penguin OS v1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Current User:</span>
              <span className="info-value">{currentUser}</span>
            </div>
            <div className="info-row">
              <span className="info-label">System Uptime:</span>
              <span className="info-value">{formatUptime(uptime)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Browser:</span>
              <span className="info-value">{navigator.userAgent.split(' ').slice(-2).join(' ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;