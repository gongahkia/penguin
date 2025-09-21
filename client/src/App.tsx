import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateUptime } from '@/store/slices/systemSlice';
import Desktop from '@/components/Desktop/Desktop';
import WindowManager from '@/components/WindowManager/WindowManager';
import NotificationSystem from '@/components/NotificationSystem/NotificationSystem';

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.user.preferences);
  const { isLocked } = useSelector((state: RootState) => state.system);

  useEffect(() => {
    // Update system uptime every second
    const uptimeInterval = setInterval(() => {
      dispatch(updateUptime());
    }, 1000);

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);

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

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(uptimeInterval);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, theme]);

  if (isLocked) {
    return <div>System is locked</div>; // TODO: Implement lock screen
  }

  return (
    <div className="app">
      <Desktop />
      <WindowManager />
      <NotificationSystem />
    </div>
  );
}

export default App;