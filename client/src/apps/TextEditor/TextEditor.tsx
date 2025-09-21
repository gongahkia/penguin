import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateFileContent, createFile } from '@/store/slices/fileSystemSlice';
import { findNodeByPath } from '@/store/slices/fileSystemSlice';
import { Save, FileOpen, FileText, Download } from 'lucide-react';
import './TextEditor.css';

interface TextEditorProps {
  windowId: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ windowId }) => {
  const dispatch = useDispatch();
  const fileSystem = useSelector((state: RootState) => state.fileSystem);
  const [content, setContent] = useState('');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update word and line count
    const words = content.trim() ? content.trim().split(/\\s+/).length : 0;
    const lines = content.split('\\n').length;
    setWordCount(words);
    setLineCount(lines);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsModified(true);

    // Update cursor position
    const textarea = e.target;
    const selectionStart = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, selectionStart);
    const lines = textBeforeCursor.split('\\n');
    const currentLine = lines.length;
    const currentColumn = lines[lines.length - 1].length + 1;

    setCursorPosition({ line: currentLine, column: currentColumn });
  };

  const handleSave = () => {
    if (!currentFile) {
      handleSaveAs();
      return;
    }

    dispatch(updateFileContent({ path: currentFile, content }));
    setIsModified(false);
  };

  const handleSaveAs = () => {
    const fileName = prompt('Enter filename:', 'untitled.txt');
    if (!fileName) return;

    const currentPath = fileSystem.currentPath;
    const filePath = `${currentPath}/${fileName}`;

    dispatch(createFile({ parentPath: currentPath, name: fileName, content }));
    setCurrentFile(filePath);
    setIsModified(false);
  };

  const handleOpen = () => {
    const filePath = prompt('Enter file path:');
    if (!filePath) return;

    const node = findNodeByPath(fileSystem.root, filePath);
    if (!node) {
      alert('File not found');
      return;
    }

    if (node.type !== 'file') {
      alert('Selected path is not a file');
      return;
    }

    setContent(node.content || '');
    setCurrentFile(filePath);
    setIsModified(false);
  };

  const handleNew = () => {
    if (isModified) {
      const save = confirm('Do you want to save the current document?');
      if (save) {
        handleSave();
      }
    }

    setContent('');
    setCurrentFile(null);
    setIsModified(false);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile ? currentFile.split('/').pop() || 'document.txt' : 'document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'o':
          e.preventDefault();
          handleOpen();
          break;
        case 'n':
          e.preventDefault();
          handleNew();
          break;
      }
    }

    // Tab handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);

      setContent(newContent);
      setIsModified(true);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="text-editor">
      <div className="text-editor-toolbar">
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={handleNew} title="New (Ctrl+N)">
            <FileText size={16} />
            <span>New</span>
          </button>
          <button className="toolbar-btn" onClick={handleOpen} title="Open (Ctrl+O)">
            <FileOpen size={16} />
            <span>Open</span>
          </button>
          <button
            className={`toolbar-btn ${isModified ? 'modified' : ''}`}
            onClick={handleSave}
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
            <span>Save{isModified ? '*' : ''}</span>
          </button>
          <button className="toolbar-btn" onClick={handleDownload} title="Download">
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>

        <div className="toolbar-info">
          <span className="file-info">
            {currentFile ? currentFile.split('/').pop() : 'Untitled'}
          </span>
        </div>
      </div>

      <div className="text-editor-main">
        <textarea
          ref={textareaRef}
          className="text-editor-textarea"
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Start typing..."
          spellCheck={false}
        />
      </div>

      <div className="text-editor-statusbar">
        <div className="status-left">
          <span>Lines: {lineCount}</span>
          <span>Words: {wordCount}</span>
          <span>Characters: {content.length}</span>
        </div>
        <div className="status-right">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.js,.ts,.css,.html,.json"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default TextEditor;