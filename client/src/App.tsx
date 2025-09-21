import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateUptime } from '@/store/slices/systemSlice';
import Desktop from '@/components/Desktop/Desktop';
import WindowManager from '@/components/WindowManager/WindowManager';
import NotificationSystem from '@/components/NotificationSystem/NotificationSystem';
import VirtualKeyboard from '@/components/VirtualKeyboard/VirtualKeyboard';
import MobileLayoutManager from '@/utils/mobileLayoutManager';
import TouchHandler from '@/utils/touchHandler';

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.user.preferences);
  const { isLocked } = useSelector((state: RootState) => state.system);

  const appRef = useRef<HTMLDivElement>(null);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState<'qwerty' | 'numeric' | 'symbols'>('qwerty');
  const [mobileLayoutManager] = useState(() => new MobileLayoutManager({
    enableSwipeNavigation: true,
    enablePullToRefresh: false,
    enableTouchScrolling: true,
    autoHideToolbars: true,
    adaptiveTextSize: true,
    largerTouchTargets: true,
    simplifiedInterface: true
  }));
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // Update system uptime every second
    const uptimeInterval = setInterval(() => {
      dispatch(updateUptime());
    }, 1000);

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);

    // Check if mobile device
    setIsMobileDevice(mobileLayoutManager.isMobile());

    // Prevent right-click context menu for OS feel
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent browser shortcuts that would break OS simulation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F5 refresh, F11 fullscreen, etc.
      if (e.key === 'F5' || e.key === 'F11' || e.key === 'F12') {
        e.preventDefault();
      }

      // Prevent Ctrl+R refresh, Ctrl+W close, etc.
      if (e.ctrlKey && (e.key === 'r' || e.key === 'w' || e.key === 't')) {
        e.preventDefault();
      }
    };

    // Setup mobile layout change handler
    const handleLayoutChange = (event: CustomEvent) => {
      setIsMobileDevice(event.detail.isMobile);
    };

    // Setup touch handlers for mobile gestures
    let touchHandler: TouchHandler | null = null;
    if (appRef.current && mobileLayoutManager.hasTouchSupport()) {
      touchHandler = new TouchHandler(appRef.current, {
        enableSwipe: true,
        enablePan: true,
        enableTap: true,
        enableLongPress: true
      }, {
        onSwipe: (gesture) => {
          if (gesture.direction === 'up' && gesture.startPosition.y > window.innerHeight * 0.8) {
            // Swipe up from bottom to show app drawer
            console.log('Swipe up for app drawer');
          } else if (gesture.direction === 'down' && gesture.startPosition.y < 100) {
            // Swipe down from top for notifications
            console.log('Swipe down for notifications');
          }
        },
        onLongPress: (gesture) => {
          // Long press for context menu on mobile
          if (mobileLayoutManager.isMobile()) {
            console.log('Long press detected on mobile');
          }
        }
      });
    }

    // Handle virtual keyboard show/hide based on focus
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (mobileLayoutManager.isMobile() &&
          (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        const inputType = (target as HTMLInputElement).type;
        if (inputType === 'number' || inputType === 'tel') {
          setKeyboardLayout('numeric');
        } else {
          setKeyboardLayout('qwerty');
        }
        setShowVirtualKeyboard(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      // Delay hiding keyboard to prevent flicker when switching inputs
      setTimeout(() => {
        if (!document.activeElement ||
            (document.activeElement.tagName !== 'INPUT' &&
             document.activeElement.tagName !== 'TEXTAREA')) {
          setShowVirtualKeyboard(false);
        }
      }, 100);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.addEventListener('layout-changed', handleLayoutChange as EventListener);

    return () => {
      clearInterval(uptimeInterval);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('layout-changed', handleLayoutChange as EventListener);
      touchHandler?.destroy();
      mobileLayoutManager.destroy();
    };
  }, [dispatch, theme, mobileLayoutManager]);

  const handleVirtualKeyPress = (key: string) => {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!activeElement) return;

    if (key === 'Backspace') {
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const value = activeElement.value;

      if (start === end && start > 0) {
        activeElement.value = value.slice(0, start - 1) + value.slice(start);
        activeElement.setSelectionRange(start - 1, start - 1);
      } else if (start !== end) {
        activeElement.value = value.slice(0, start) + value.slice(end);
        activeElement.setSelectionRange(start, start);
      }
    } else if (key === 'Enter') {
      if (activeElement.tagName === 'TEXTAREA') {
        const start = activeElement.selectionStart || 0;
        const value = activeElement.value;
        activeElement.value = value.slice(0, start) + '\n' + value.slice(start);
        activeElement.setSelectionRange(start + 1, start + 1);
      } else {
        activeElement.blur();
      }
    } else {
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const value = activeElement.value;

      activeElement.value = value.slice(0, start) + key + value.slice(end);
      activeElement.setSelectionRange(start + key.length, start + key.length);
    }

    // Trigger input event for React
    const event = new Event('input', { bubbles: true });
    activeElement.dispatchEvent(event);
  };

  if (isLocked) {
    return <div>System is locked</div>; // TODO: Implement lock screen
  }

  return (
    <div className={`app ${isMobileDevice ? 'mobile-mode' : 'desktop-mode'}`} ref={appRef}>
      <Desktop />
      <WindowManager />
      <NotificationSystem />
      {showVirtualKeyboard && (
        <VirtualKeyboard
          isVisible={showVirtualKeyboard}
          onKeyPress={handleVirtualKeyPress}
          onClose={() => setShowVirtualKeyboard(false)}
          layout={keyboardLayout}
          theme={theme}
          hapticFeedback={true}
          soundEnabled={false}
        />
      )}
    </div>
  );
}

export default App;