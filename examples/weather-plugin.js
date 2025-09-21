/* MANIFEST
{
  "id": "weather-widget-plugin",
  "name": "Weather Widget",
  "version": "1.0.0",
  "description": "Display current weather information and forecasts",
  "author": "Penguin OS Team",
  "icon": "🌤️",
  "permissions": [
    {
      "type": "network",
      "description": "Fetch weather data from external APIs"
    },
    {
      "type": "storage",
      "description": "Store weather preferences and cached data"
    },
    {
      "type": "notifications",
      "description": "Show weather alerts and updates"
    }
  ],
  "entryPoint": "WeatherPlugin",
  "minPenguinVersion": "1.0.0",
  "tags": ["weather", "widgets", "information"]
}
*/

class WeatherPlugin {
  constructor() {
    this.context = null;
    this.windowId = null;
    this.updateInterval = null;
    this.defaultLocation = 'New York';
  }

  async activate(context) {
    this.context = context;
    console.log('Weather Plugin activated!');

    // Load saved preferences
    await this.loadPreferences();

    // Register shortcut to open weather widget
    await this.context.api.ui.registerShortcut('ctrl+shift+w', () => {
      this.openWeatherWindow();
    });

    this.context.logger.log('Weather Plugin successfully activated');
  }

  async deactivate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.windowId) {
      await this.context.api.system.closeWindow(this.windowId);
    }
    console.log('Weather Plugin deactivated!');
  }

  async loadPreferences() {
    try {
      const prefs = await this.context.storage.get('preferences');
      if (prefs && prefs.location) {
        this.defaultLocation = prefs.location;
      }
    } catch (error) {
      this.context.logger.error('Failed to load preferences:', error);
    }
  }

  async savePreferences() {
    try {
      await this.context.storage.set('preferences', {
        location: this.defaultLocation
      });
    } catch (error) {
      this.context.logger.error('Failed to save preferences:', error);
    }
  }

  async openWeatherWindow() {
    if (this.windowId) {
      return;
    }

    try {
      this.windowId = await this.context.api.system.openWindow({
        title: 'Weather Widget',
        component: this.createWeatherComponent(),
        size: { width: 350, height: 400 },
        position: { x: 300, y: 100 }
      });
    } catch (error) {
      this.context.logger.error('Failed to open weather window:', error);
    }
  }

  createWeatherComponent() {
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      height: 100%;
      background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
      color: white;
      display: flex;
      flex-direction: column;
    `;

    // Header
    const header = document.createElement('div');
    header.innerHTML = '<h2 style="margin: 0 0 20px 0; text-align: center;">🌤️ Weather</h2>';
    container.appendChild(header);

    // Location input
    const locationForm = document.createElement('form');
    locationForm.style.cssText = 'display: flex; gap: 8px; margin-bottom: 20px;';

    const locationInput = document.createElement('input');
    locationInput.type = 'text';
    locationInput.value = this.defaultLocation;
    locationInput.placeholder = 'Enter location...';
    locationInput.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 20px;
      font-size: 14px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      backdrop-filter: blur(10px);
    `;

    const updateButton = document.createElement('button');
    updateButton.textContent = '🔄';
    updateButton.type = 'submit';
    updateButton.style.cssText = `
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      backdrop-filter: blur(10px);
    `;

    locationForm.appendChild(locationInput);
    locationForm.appendChild(updateButton);
    container.appendChild(locationForm);

    // Weather display
    const weatherDisplay = document.createElement('div');
    weatherDisplay.style.cssText = 'flex: 1; text-align: center;';
    container.appendChild(weatherDisplay);

    // Event handlers
    locationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = locationInput.value.trim();
      if (location) {
        this.defaultLocation = location;
        this.savePreferences();
        this.updateWeather(weatherDisplay);
      }
    });

    // Initial weather load
    this.updateWeather(weatherDisplay);

    // Auto-update every 10 minutes
    this.updateInterval = setInterval(() => {
      this.updateWeather(weatherDisplay);
    }, 10 * 60 * 1000);

    return container;
  }

  async updateWeather(weatherDisplay) {
    weatherDisplay.innerHTML = '<div style="margin-top: 40px;">🔄 Loading weather...</div>';

    try {
      // Simulate weather API call (in a real plugin, this would be a real API)
      const weatherData = await this.simulateWeatherAPI(this.defaultLocation);
      this.renderWeather(weatherDisplay, weatherData);
    } catch (error) {
      this.context.logger.error('Failed to fetch weather:', error);
      weatherDisplay.innerHTML = `
        <div style="margin-top: 40px; color: rgba(255, 255, 255, 0.8);">
          ❌ Failed to load weather data
        </div>
      `;
    }
  }

  async simulateWeatherAPI(location) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate random weather data
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Overcast'];
    const icons = ['☀️', '☁️', '🌧️', '⛅', '☁️'];

    const conditionIndex = Math.floor(Math.random() * conditions.length);
    const temperature = Math.floor(Math.random() * 30) + 10; // 10-40°C
    const humidity = Math.floor(Math.random() * 50) + 30; // 30-80%
    const windSpeed = Math.floor(Math.random() * 20) + 5; // 5-25 km/h

    return {
      location,
      condition: conditions[conditionIndex],
      icon: icons[conditionIndex],
      temperature,
      humidity,
      windSpeed,
      updatedAt: new Date()
    };
  }

  renderWeather(weatherDisplay, data) {
    weatherDisplay.innerHTML = `
      <div style="margin-top: 20px;">
        <div style="font-size: 24px; margin-bottom: 10px;">${data.location}</div>

        <div style="font-size: 64px; margin: 20px 0;">${data.icon}</div>

        <div style="font-size: 32px; font-weight: bold; margin-bottom: 20px;">
          ${data.temperature}°C
        </div>

        <div style="font-size: 18px; margin-bottom: 20px; opacity: 0.9;">
          ${data.condition}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
          <div style="background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 10px; backdrop-filter: blur(10px);">
            <div style="font-size: 12px; opacity: 0.8;">HUMIDITY</div>
            <div style="font-size: 18px; font-weight: bold;">${data.humidity}%</div>
          </div>
          <div style="background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 10px; backdrop-filter: blur(10px);">
            <div style="font-size: 12px; opacity: 0.8;">WIND</div>
            <div style="font-size: 18px; font-weight: bold;">${data.windSpeed} km/h</div>
          </div>
        </div>

        <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
          Updated: ${data.updatedAt.toLocaleTimeString()}
        </div>
      </div>
    `;

    // Show notification for extreme weather
    if (data.temperature > 35) {
      this.context.api.system.showNotification('🌡️ High temperature alert!');
    } else if (data.condition === 'Rainy') {
      this.context.api.system.showNotification('🌧️ Rain expected today!');
    }
  }
}

// Export the plugin
module.exports = new WeatherPlugin();