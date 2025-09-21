import React, { useState, useEffect, useCallback } from 'react';
import './VirtualKeyboard.css';

interface VirtualKeyboardProps {
  isVisible: boolean;
  onKeyPress: (key: string) => void;
  onClose: () => void;
  layout?: 'qwerty' | 'numeric' | 'symbols';
  theme?: 'light' | 'dark';
  hapticFeedback?: boolean;
  soundEnabled?: boolean;
}

interface KeyboardKey {
  key: string;
  display?: string;
  width?: number;
  action?: 'backspace' | 'enter' | 'shift' | 'space' | 'layout' | 'close';
  nextLayout?: string;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  isVisible,
  onKeyPress,
  onClose,
  layout = 'qwerty',
  theme = 'light',
  hapticFeedback = true,
  soundEnabled = false
}) => {
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);

  const qwertyLayout: KeyboardKey[][] = [
    [
      { key: 'q' }, { key: 'w' }, { key: 'e' }, { key: 'r' }, { key: 't' },
      { key: 'y' }, { key: 'u' }, { key: 'i' }, { key: 'o' }, { key: 'p' }
    ],
    [
      { key: 'a' }, { key: 's' }, { key: 'd' }, { key: 'f' }, { key: 'g' },
      { key: 'h' }, { key: 'j' }, { key: 'k' }, { key: 'l' }
    ],
    [
      { key: 'shift', display: '⇧', action: 'shift', width: 1.5 },
      { key: 'z' }, { key: 'x' }, { key: 'c' }, { key: 'v' },
      { key: 'b' }, { key: 'n' }, { key: 'm' },
      { key: 'backspace', display: '⌫', action: 'backspace', width: 1.5 }
    ],
    [
      { key: '123', display: '123', action: 'layout', nextLayout: 'numeric', width: 1.5 },
      { key: 'space', display: 'space', action: 'space', width: 5 },
      { key: 'enter', display: '↵', action: 'enter', width: 1.5 },
      { key: 'close', display: '✕', action: 'close', width: 1 }
    ]
  ];

  const numericLayout: KeyboardKey[][] = [
    [
      { key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }, { key: '5' },
      { key: '6' }, { key: '7' }, { key: '8' }, { key: '9' }, { key: '0' }
    ],
    [
      { key: '-' }, { key: '/' }, { key: ':' }, { key: ';' }, { key: '(' },
      { key: ')' }, { key: '$' }, { key: '&' }, { key: '@' }, { key: '"' }
    ],
    [
      { key: '#+=', display: '#+=', action: 'layout', nextLayout: 'symbols', width: 1.5 },
      { key: '.' }, { key: ',' }, { key: '?' }, { key: '!' }, { key: "'" },
      { key: 'backspace', display: '⌫', action: 'backspace', width: 2.5 }
    ],
    [
      { key: 'ABC', display: 'ABC', action: 'layout', nextLayout: 'qwerty', width: 1.5 },
      { key: 'space', display: 'space', action: 'space', width: 5 },
      { key: 'enter', display: '↵', action: 'enter', width: 1.5 },
      { key: 'close', display: '✕', action: 'close', width: 1 }
    ]
  ];

  const symbolsLayout: KeyboardKey[][] = [
    [
      { key: '[' }, { key: ']' }, { key: '{' }, { key: '}' }, { key: '#' },
      { key: '%' }, { key: '^' }, { key: '*' }, { key: '+' }, { key: '=' }
    ],
    [
      { key: '_' }, { key: '\\' }, { key: '|' }, { key: '~' }, { key: '<' },
      { key: '>' }, { key: '€' }, { key: '£' }, { key: '¥' }, { key: '•' }
    ],
    [
      { key: '123', display: '123', action: 'layout', nextLayout: 'numeric', width: 1.5 },
      { key: '.' }, { key: ',' }, { key: '?' }, { key: '!' }, { key: "'" },
      { key: 'backspace', display: '⌫', action: 'backspace', width: 2.5 }
    ],
    [
      { key: 'ABC', display: 'ABC', action: 'layout', nextLayout: 'qwerty', width: 1.5 },
      { key: 'space', display: 'space', action: 'space', width: 5 },
      { key: 'enter', display: '↵', action: 'enter', width: 1.5 },
      { key: 'close', display: '✕', action: 'close', width: 1 }
    ]
  ];

  const getLayout = (layoutType: string): KeyboardKey[][] => {
    switch (layoutType) {
      case 'numeric': return numericLayout;
      case 'symbols': return symbolsLayout;
      default: return qwertyLayout;
    }
  };

  const playKeySound = useCallback(() => {
    if (!soundEnabled) return;

    // Create a short click sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [soundEnabled]);

  const triggerHapticFeedback = useCallback(() => {
    if (!hapticFeedback || !('vibrate' in navigator)) return;

    navigator.vibrate(30); // Short vibration
  }, [hapticFeedback]);

  const handleKeyPress = useCallback((keyData: KeyboardKey) => {
    playKeySound();
    triggerHapticFeedback();

    switch (keyData.action) {
      case 'backspace':
        onKeyPress('Backspace');
        break;

      case 'enter':
        onKeyPress('Enter');
        break;

      case 'shift':
        setIsShiftActive(prev => {
          const newState = !prev;
          if (newState && isShiftActive) {
            setIsCapsLock(true);
          } else if (!newState) {
            setIsCapsLock(false);
          }
          return newState;
        });
        break;

      case 'space':
        onKeyPress(' ');
        break;

      case 'layout':
        if (keyData.nextLayout) {
          setCurrentLayout(keyData.nextLayout);
        }
        break;

      case 'close':
        onClose();
        break;

      default:
        let key = keyData.key;
        if (currentLayout === 'qwerty' && (isShiftActive || isCapsLock)) {
          key = key.toUpperCase();
          if (!isCapsLock) {
            setIsShiftActive(false);
          }
        }
        onKeyPress(key);
        break;
    }
  }, [onKeyPress, onClose, isShiftActive, isCapsLock, currentLayout, playKeySound, triggerHapticFeedback]);

  const renderKey = (keyData: KeyboardKey, rowIndex: number, keyIndex: number) => {
    const isActive = keyData.action === 'shift' && (isShiftActive || isCapsLock);
    const isCapsLockKey = keyData.action === 'shift' && isCapsLock;

    let displayKey = keyData.display || keyData.key;
    if (currentLayout === 'qwerty' && !keyData.action && (isShiftActive || isCapsLock)) {
      displayKey = displayKey.toUpperCase();
    }

    return (
      <button
        key={`${rowIndex}-${keyIndex}`}
        className={`
          virtual-key
          ${keyData.action ? `key-${keyData.action}` : 'key-letter'}
          ${isActive ? 'key-active' : ''}
          ${isCapsLockKey ? 'key-caps-lock' : ''}
        `}
        style={{
          flexGrow: keyData.width || 1,
          flexBasis: keyData.width ? `${keyData.width * 10}%` : '10%'
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleKeyPress(keyData);
        }}
        onClick={(e) => {
          e.preventDefault();
          handleKeyPress(keyData);
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <span className="key-label">{displayKey}</span>
      </button>
    );
  };

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout]);

  useEffect(() => {
    // Prevent background scrolling when keyboard is visible
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`virtual-keyboard ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <div className="keyboard-header">
        <div className="keyboard-indicator">
          {currentLayout.toUpperCase()}
          {isCapsLock && <span className="caps-indicator">🔒</span>}
        </div>
        <button
          className="keyboard-close"
          onClick={onClose}
          onTouchStart={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          ✕
        </button>
      </div>

      <div className="keyboard-layout">
        {getLayout(currentLayout).map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((keyData, keyIndex) => renderKey(keyData, rowIndex, keyIndex))}
          </div>
        ))}
      </div>

      <div className="keyboard-suggestions">
        <div className="suggestion-chips">
          <button className="suggestion-chip">the</button>
          <button className="suggestion-chip">and</button>
          <button className="suggestion-chip">for</button>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;