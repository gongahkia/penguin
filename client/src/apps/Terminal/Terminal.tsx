import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  createTerminalInstance,
  destroyTerminalInstance,
  updateInput,
  addOutput,
  executeCommand,
  setProcessingComplete,
  navigateHistory,
  clearTerminal,
} from '@/store/slices/terminalSlice';
import { executeCommand as executeTerminalCommand } from '@/utils/commandRegistry';
import { advancedTerminal } from '@/utils/advancedTerminal';
import './Terminal.css';

interface TerminalProps {
  windowId: string;
}

const Terminal: React.FC<TerminalProps> = ({ windowId }) => {
  const dispatch = useDispatch();
  const terminal = useSelector((state: RootState) => state.terminal.instances[windowId]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(true);

  // Create terminal instance when component mounts
  useEffect(() => {
    if (!terminal) {
      dispatch(createTerminalInstance(windowId));
    }

    return () => {
      if (terminal) {
        dispatch(destroyTerminalInstance(windowId));
      }
    };
  }, [dispatch, windowId, terminal]);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminal?.output]);

  // Focus input when terminal is clicked
  useEffect(() => {
    const handleTerminalClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
        setIsInputFocused(true);
      }
    };

    const terminalElement = terminalRef.current;
    if (terminalElement) {
      terminalElement.addEventListener('click', handleTerminalClick);
      return () => terminalElement.removeEventListener('click', handleTerminalClick);
    }
  }, []);

  if (!terminal) {
    return <div className="terminal-loading">Initializing terminal...</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateInput({ instanceId: windowId, input: e.target.value }));
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (terminal.input.trim()) {
          dispatch(executeCommand({ instanceId: windowId, command: terminal.input }));

          try {
            // Use advanced terminal for enhanced features
            const result = await advancedTerminal.executeCommand(terminal.input, terminal);

            if (result === '__CLEAR_TERMINAL__') {
              dispatch(clearTerminal(windowId));
            } else if (result) {
              dispatch(addOutput({
                instanceId: windowId,
                content: result,
                type: 'output'
              }));
            }
          } catch (error) {
            dispatch(addOutput({
              instanceId: windowId,
              content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              type: 'error'
            }));
          } finally {
            dispatch(setProcessingComplete(windowId));
          }
        } else {
          dispatch(updateInput({ instanceId: windowId, input: '' }));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        dispatch(navigateHistory({ instanceId: windowId, direction: 'up' }));
        break;

      case 'ArrowDown':
        e.preventDefault();
        dispatch(navigateHistory({ instanceId: windowId, direction: 'down' }));
        break;

      case 'Tab':
        e.preventDefault();
        // TODO: Implement auto-completion
        break;

      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          dispatch(updateInput({ instanceId: windowId, input: '' }));
        }
        break;

      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          dispatch(clearTerminal(windowId));
        }
        break;
    }
  };

  const getPrompt = () => {
    return `${terminal.workingDirectory}$ `;
  };

  const formatOutput = (content: string) => {
    return content.split('\\n').map((line, index) => (
      <div key={index} className="terminal-line">
        {line}
      </div>
    ));
  };

  return (
    <div className="terminal-container">
      <div className="terminal-output" ref={terminalRef}>
        {terminal.output.map((line) => (
          <div
            key={line.id}
            className={`terminal-output-line terminal-output-${line.type}`}
          >
            {line.type === 'input' ? (
              <div className="terminal-command-line">
                <span className="terminal-prompt">{getPrompt()}</span>
                <span className="terminal-command">{line.content.replace(getPrompt(), '')}</span>
              </div>
            ) : line.type === 'system' ? (
              <div className="terminal-system-line">{line.content}</div>
            ) : (
              <div className={`terminal-${line.type}-line`}>
                {formatOutput(line.content)}
              </div>
            )}
          </div>
        ))}

        {!terminal.isProcessing && (
          <div className="terminal-input-line">
            <span className="terminal-prompt">{getPrompt()}</span>
            <input
              ref={inputRef}
              type="text"
              value={terminal.input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className={`terminal-input ${isInputFocused ? 'focused' : ''}`}
              autoComplete="off"
              spellCheck={false}
            />
            <span className={`terminal-cursor ${isInputFocused ? 'blink' : ''}`}>█</span>
          </div>
        )}

        {terminal.isProcessing && (
          <div className="terminal-processing">
            <span className="terminal-spinner">⠋</span>
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;