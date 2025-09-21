import React, { useState, useEffect } from 'react';
import './ScriptEditor.css';

interface ScriptEditorProps {
  windowId: string;
}

interface Script {
  name: string;
  content: string;
  language: 'bash' | 'javascript' | 'python';
  description: string;
  created: Date;
  modified: Date;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ windowId }) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [activeScript, setActiveScript] = useState<Script | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'bash' | 'javascript' | 'python'>('bash');

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = () => {
    // Load scripts from localStorage
    const stored = localStorage.getItem('penguin-scripts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setScripts(parsed.map((s: any) => ({
          ...s,
          created: new Date(s.created),
          modified: new Date(s.modified)
        })));
      } catch (error) {
        console.error('Failed to load scripts:', error);
      }
    }
  };

  const saveScripts = (updatedScripts: Script[]) => {
    localStorage.setItem('penguin-scripts', JSON.stringify(updatedScripts));
    setScripts(updatedScripts);
  };

  const createNewScript = () => {
    const newScript: Script = {
      name: 'Untitled Script',
      content: getTemplateForLanguage(selectedLanguage),
      language: selectedLanguage,
      description: '',
      created: new Date(),
      modified: new Date()
    };

    setActiveScript(newScript);
    setIsCreating(true);
  };

  const saveScript = () => {
    if (!activeScript) return;

    const updatedScripts = [...scripts];
    const existingIndex = scripts.findIndex(s => s.name === activeScript.name && !isCreating);

    if (existingIndex !== -1) {
      updatedScripts[existingIndex] = {
        ...activeScript,
        modified: new Date()
      };
    } else {
      updatedScripts.push({
        ...activeScript,
        created: new Date(),
        modified: new Date()
      });
    }

    saveScripts(updatedScripts);
    setIsCreating(false);
  };

  const deleteScript = (scriptName: string) => {
    if (!confirm(`Are you sure you want to delete "${scriptName}"?`)) {
      return;
    }

    const updatedScripts = scripts.filter(s => s.name !== scriptName);
    saveScripts(updatedScripts);

    if (activeScript?.name === scriptName) {
      setActiveScript(null);
    }
  };

  const runScript = async (script: Script) => {
    // In a real implementation, this would execute the script
    // For now, we'll simulate execution
    console.log(`Executing ${script.language} script: ${script.name}`);
    alert(`Executing script "${script.name}"\n\nLanguage: ${script.language}\nContent length: ${script.content.length} characters`);
  };

  const getTemplateForLanguage = (language: string): string => {
    switch (language) {
      case 'bash':
        return `#!/bin/bash
# Script: Untitled Script
# Description:

echo "Hello from Penguin OS!"
`;

      case 'javascript':
        return `// Script: Untitled Script
// Description:

console.log("Hello from Penguin OS!");
`;

      case 'python':
        return `#!/usr/bin/env python3
# Script: Untitled Script
# Description:

print("Hello from Penguin OS!")
`;

      default:
        return '';
    }
  };

  const getLanguageIcon = (language: string): string => {
    switch (language) {
      case 'bash': return '🐚';
      case 'javascript': return '📜';
      case 'python': return '🐍';
      default: return '📄';
    }
  };

  const filteredScripts = scripts.filter(script =>
    script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    script.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="script-editor">
      <div className="script-editor-sidebar">
        <div className="sidebar-header">
          <h3>Scripts</h3>
          <div className="sidebar-actions">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="language-select"
            >
              <option value="bash">Bash</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
            <button onClick={createNewScript} className="create-btn">
              New
            </button>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="script-list">
          {filteredScripts.length === 0 ? (
            <div className="empty-state">
              <p>No scripts found</p>
              <button onClick={createNewScript} className="create-first-btn">
                Create your first script
              </button>
            </div>
          ) : (
            filteredScripts.map(script => (
              <div
                key={script.name}
                className={`script-item ${activeScript?.name === script.name ? 'active' : ''}`}
                onClick={() => setActiveScript(script)}
              >
                <div className="script-icon">
                  {getLanguageIcon(script.language)}
                </div>
                <div className="script-info">
                  <div className="script-name">{script.name}</div>
                  <div className="script-meta">
                    <span className="script-language">{script.language}</span>
                    <span className="script-date">
                      {script.modified.toLocaleDateString()}
                    </span>
                  </div>
                  {script.description && (
                    <div className="script-description">{script.description}</div>
                  )}
                </div>
                <div className="script-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runScript(script);
                    }}
                    className="action-btn run"
                    title="Run script"
                  >
                    ▶
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScript(script.name);
                    }}
                    className="action-btn delete"
                    title="Delete script"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="script-editor-main">
        {activeScript ? (
          <>
            <div className="editor-header">
              <div className="script-details">
                <input
                  type="text"
                  value={activeScript.name}
                  onChange={(e) => setActiveScript({
                    ...activeScript,
                    name: e.target.value
                  })}
                  className="script-name-input"
                  placeholder="Script name"
                />
                <select
                  value={activeScript.language}
                  onChange={(e) => setActiveScript({
                    ...activeScript,
                    language: e.target.value as any
                  })}
                  className="language-select"
                >
                  <option value="bash">Bash</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>
              <div className="editor-actions">
                <button
                  onClick={() => runScript(activeScript)}
                  className="action-btn run-main"
                >
                  ▶ Run
                </button>
                <button
                  onClick={saveScript}
                  className="action-btn save"
                >
                  💾 Save
                </button>
              </div>
            </div>

            <div className="script-metadata">
              <input
                type="text"
                value={activeScript.description}
                onChange={(e) => setActiveScript({
                  ...activeScript,
                  description: e.target.value
                })}
                placeholder="Script description (optional)"
                className="description-input"
              />
            </div>

            <div className="code-editor">
              <textarea
                value={activeScript.content}
                onChange={(e) => setActiveScript({
                  ...activeScript,
                  content: e.target.value
                })}
                className="code-textarea"
                placeholder="Enter your script code here..."
                spellCheck={false}
              />
            </div>

            <div className="editor-footer">
              <div className="editor-info">
                <span>Lines: {activeScript.content.split('\n').length}</span>
                <span>Characters: {activeScript.content.length}</span>
                <span>Language: {activeScript.language}</span>
              </div>
              <div className="syntax-help">
                <button className="help-btn">
                  ? Syntax Help
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-script-selected">
            <div className="welcome-content">
              <h2>Script Editor</h2>
              <p>Create and manage shell scripts, JavaScript, and Python scripts for Penguin OS.</p>

              <div className="features">
                <div className="feature">
                  <div className="feature-icon">🐚</div>
                  <h4>Shell Scripts</h4>
                  <p>Create powerful bash scripts for system automation</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">📜</div>
                  <h4>JavaScript</h4>
                  <p>Build interactive scripts and utilities</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🐍</div>
                  <h4>Python</h4>
                  <p>Write Python scripts for data processing and more</p>
                </div>
              </div>

              <button onClick={createNewScript} className="get-started-btn">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptEditor;