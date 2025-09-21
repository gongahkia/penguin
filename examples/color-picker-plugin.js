/* MANIFEST
{
  "id": "color-picker-plugin",
  "name": "Color Picker",
  "version": "1.0.0",
  "description": "Professional color picker tool for designers and developers",
  "author": "Penguin OS Team",
  "icon": "🎨",
  "permissions": [
    {
      "type": "storage",
      "description": "Save color palettes and history"
    },
    {
      "type": "filesystem",
      "description": "Export color palettes to files"
    }
  ],
  "entryPoint": "ColorPickerPlugin",
  "minPenguinVersion": "1.0.0",
  "tags": ["design", "tools", "colors", "utilities"]
}
*/

class ColorPickerPlugin {
  constructor() {
    this.context = null;
    this.windowId = null;
    this.colorHistory = [];
    this.savedPalettes = [];
  }

  async activate(context) {
    this.context = context;
    console.log('Color Picker Plugin activated!');

    // Load saved data
    await this.loadData();

    // Register shortcut
    await this.context.api.ui.registerShortcut('ctrl+shift+c', () => {
      this.openColorPicker();
    });

    this.context.logger.log('Color Picker Plugin successfully activated');
  }

  async deactivate() {
    if (this.windowId) {
      await this.context.api.system.closeWindow(this.windowId);
    }
    console.log('Color Picker Plugin deactivated!');
  }

  async loadData() {
    try {
      const history = await this.context.storage.get('colorHistory');
      const palettes = await this.context.storage.get('savedPalettes');

      this.colorHistory = history || [];
      this.savedPalettes = palettes || [];
    } catch (error) {
      this.context.logger.error('Failed to load data:', error);
    }
  }

  async saveData() {
    try {
      await this.context.storage.set('colorHistory', this.colorHistory);
      await this.context.storage.set('savedPalettes', this.savedPalettes);
    } catch (error) {
      this.context.logger.error('Failed to save data:', error);
    }
  }

  async openColorPicker() {
    if (this.windowId) {
      return;
    }

    try {
      this.windowId = await this.context.api.system.openWindow({
        title: 'Color Picker',
        component: this.createColorPickerComponent(),
        size: { width: 500, height: 600 },
        position: { x: 250, y: 50 }
      });
    } catch (error) {
      this.context.logger.error('Failed to open color picker window:', error);
    }
  }

  createColorPickerComponent() {
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f8f9fa;
    `;

    // Header
    const header = document.createElement('div');
    header.innerHTML = '<h2 style="margin: 0 0 20px 0; color: #333; text-align: center;">🎨 Color Picker</h2>';
    container.appendChild(header);

    // Color picker input
    const pickerSection = document.createElement('div');
    pickerSection.style.cssText = 'margin-bottom: 20px; text-align: center;';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#3498db';
    colorInput.style.cssText = `
      width: 100px;
      height: 100px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    const colorDisplay = document.createElement('div');
    colorDisplay.style.cssText = `
      margin-top: 15px;
      padding: 10px;
      background: white;
      border-radius: 8px;
      border: 1px solid #ddd;
    `;

    pickerSection.appendChild(colorInput);
    pickerSection.appendChild(colorDisplay);
    container.appendChild(pickerSection);

    // Action buttons
    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;';

    const copyButton = document.createElement('button');
    copyButton.textContent = '📋 Copy';
    copyButton.style.cssText = this.getButtonStyles('#007bff');

    const addToPaletteButton = document.createElement('button');
    addToPaletteButton.textContent = '💾 Save Color';
    addToPaletteButton.style.cssText = this.getButtonStyles('#28a745');

    const exportButton = document.createElement('button');
    exportButton.textContent = '📁 Export Palette';
    exportButton.style.cssText = this.getButtonStyles('#6f42c1');

    actions.appendChild(copyButton);
    actions.appendChild(addToPaletteButton);
    actions.appendChild(exportButton);
    container.appendChild(actions);

    // Color history section
    const historySection = document.createElement('div');
    historySection.style.cssText = 'margin-bottom: 20px;';

    const historyTitle = document.createElement('h3');
    historyTitle.textContent = 'Recent Colors';
    historyTitle.style.cssText = 'margin: 0 0 10px 0; color: #333; font-size: 16px;';
    historySection.appendChild(historyTitle);

    const historyContainer = document.createElement('div');
    historyContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
      gap: 8px;
      max-height: 100px;
      overflow-y: auto;
    `;
    historySection.appendChild(historyContainer);
    container.appendChild(historySection);

    // Palette section
    const paletteSection = document.createElement('div');
    paletteSection.style.cssText = 'flex: 1; overflow-y: auto;';

    const paletteTitle = document.createElement('h3');
    paletteTitle.textContent = 'Saved Palette';
    paletteTitle.style.cssText = 'margin: 0 0 10px 0; color: #333; font-size: 16px;';
    paletteSection.appendChild(paletteTitle);

    const paletteContainer = document.createElement('div');
    paletteContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 10px;
    `;
    paletteSection.appendChild(paletteContainer);
    container.appendChild(paletteSection);

    // Event handlers
    const updateColorDisplay = () => {
      const color = colorInput.value;
      const rgb = this.hexToRgb(color);
      const hsl = this.hexToHsl(color);

      colorDisplay.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
          <div><strong>HEX:</strong> ${color.toUpperCase()}</div>
          <div><strong>RGB:</strong> ${rgb.r}, ${rgb.g}, ${rgb.b}</div>
          <div><strong>HSL:</strong> ${hsl.h}°, ${hsl.s}%, ${hsl.l}%</div>
          <div><strong>CSS:</strong> rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</div>
        </div>
      `;
    };

    colorInput.addEventListener('input', () => {
      updateColorDisplay();
      this.addToHistory(colorInput.value);
      this.renderHistory(historyContainer);
    });

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(colorInput.value).then(() => {
        this.context.api.system.showNotification('📋 Color copied to clipboard!');
      });
    });

    addToPaletteButton.addEventListener('click', () => {
      this.addToPalette(colorInput.value);
      this.renderPalette(paletteContainer);
    });

    exportButton.addEventListener('click', () => {
      this.exportPalette();
    });

    // Initial render
    updateColorDisplay();
    this.renderHistory(historyContainer);
    this.renderPalette(paletteContainer);

    return container;
  }

  getButtonStyles(color) {
    return `
      padding: 8px 16px;
      background: ${color};
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: opacity 0.2s;
    `;
  }

  addToHistory(color) {
    if (!this.colorHistory.includes(color)) {
      this.colorHistory.unshift(color);
      this.colorHistory = this.colorHistory.slice(0, 20); // Keep last 20
      this.saveData();
    }
  }

  addToPalette(color) {
    if (!this.savedPalettes.includes(color)) {
      this.savedPalettes.push(color);
      this.saveData();
      this.context.api.system.showNotification('🎨 Color added to palette!');
    }
  }

  renderHistory(container) {
    container.innerHTML = '';
    this.colorHistory.forEach(color => {
      const colorSwatch = this.createColorSwatch(color, '40px');
      container.appendChild(colorSwatch);
    });
  }

  renderPalette(container) {
    container.innerHTML = '';
    this.savedPalettes.forEach(color => {
      const colorSwatch = this.createColorSwatch(color, '60px', true);
      container.appendChild(colorSwatch);
    });
  }

  createColorSwatch(color, size, showDelete = false) {
    const swatch = document.createElement('div');
    swatch.style.cssText = `
      width: ${size};
      height: ${size};
      background: ${color};
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      position: relative;
      transition: transform 0.2s;
    `;

    swatch.addEventListener('click', () => {
      navigator.clipboard.writeText(color);
      this.context.api.system.showNotification(`📋 ${color} copied!`);
    });

    swatch.addEventListener('mouseenter', () => {
      swatch.style.transform = 'scale(1.1)';
    });

    swatch.addEventListener('mouseleave', () => {
      swatch.style.transform = 'scale(1)';
    });

    if (showDelete) {
      const deleteBtn = document.createElement('div');
      deleteBtn.textContent = '×';
      deleteBtn.style.cssText = `
        position: absolute;
        top: -5px;
        right: -5px;
        width: 20px;
        height: 20px;
        background: #dc3545;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        cursor: pointer;
        font-weight: bold;
      `;

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFromPalette(color);
      });

      swatch.appendChild(deleteBtn);
    }

    return swatch;
  }

  removeFromPalette(color) {
    this.savedPalettes = this.savedPalettes.filter(c => c !== color);
    this.saveData();
  }

  async exportPalette() {
    if (this.savedPalettes.length === 0) {
      this.context.api.system.showNotification('❌ No colors in palette to export');
      return;
    }

    const paletteData = {
      name: `Color Palette ${new Date().toLocaleDateString()}`,
      colors: this.savedPalettes,
      exportedAt: new Date().toISOString()
    };

    const jsonContent = JSON.stringify(paletteData, null, 2);

    try {
      await this.context.api.fs.writeFile(
        `/home/user/Documents/color-palette-${Date.now()}.json`,
        jsonContent
      );
      this.context.api.system.showNotification('📁 Palette exported to Documents!');
    } catch (error) {
      this.context.logger.error('Failed to export palette:', error);
      this.context.api.system.showNotification('❌ Failed to export palette');
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }
}

// Export the plugin
module.exports = new ColorPickerPlugin();