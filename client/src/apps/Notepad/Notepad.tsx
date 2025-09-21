import React, { useState } from 'react';
import './Notepad.css';

interface NotepadProps {
  windowId: string;
}

const Notepad: React.FC<NotepadProps> = ({ windowId }) => {
  const [content, setContent] = useState('Welcome to Penguin Notepad!\n\nThis is a simple text editor for quick notes and thoughts.\n\nFeatures:\n- Real-time character and word count\n- Auto-save functionality\n- Simple and clean interface\n\nStart typing to replace this text...');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  React.useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(content.length);
  }, [content]);

  const handleClear = () => {
    if (confirm('Clear all content?')) {
      setContent('');
    }
  };

  const handleSampleText = () => {
    const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;
    setContent(sampleText);
  };

  return (
    <div className="notepad">
      <div className="notepad-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={handleClear}>
            Clear
          </button>
          <button className="toolbar-btn" onClick={handleSampleText}>
            Sample Text
          </button>
        </div>
        
        <div className="toolbar-right">
          <div className="word-count">
            Words: {wordCount} | Characters: {charCount}
          </div>
        </div>
      </div>

      <div className="notepad-content">
        <textarea
          className="notepad-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your notes here..."
          spellCheck
        />
      </div>
    </div>
  );
};

export default Notepad;