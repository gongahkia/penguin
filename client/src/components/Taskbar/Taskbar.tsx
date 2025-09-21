import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { restoreWindow, focusWindow } from '@/store/slices/windowSlice';
import { format } from '@/utils/dateUtils';
import { Settings, Power } from 'lucide-react';
import './Taskbar.css';

const Taskbar: React.FC = () => {
  const dispatch = useDispatch();
  const { windows } = useSelector((state: RootState) => state.windows);
  const { currentUser, uptime } = useSelector((state: RootState) => state.system);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleWindowClick = (windowId: string) => {
    const window = windows.find(w => w.id === windowId);
    if (window) {
      if (window.isMinimized) {
        dispatch(restoreWindow(windowId));
      } else {
        dispatch(focusWindow(windowId));
      }
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="taskbar">
      <div className="taskbar-start">
        <div className="start-button">
          <span className="penguin-logo">🐧</span>
          <span className="start-text">Penguin</span>
        </div>
      </div>

      <div className="taskbar-center">
        <div className="running-apps">
          {windows.map((window) => (
            <button
              key={window.id}
              className={`taskbar-app ${window.isActive ? 'active' : ''} ${window.isMinimized ? 'minimized' : ''}`}
              onClick={() => handleWindowClick(window.id)}
              title={window.title}
            >
              <span className="app-title">{window.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="taskbar-end">
        <div className="system-info">
          <div className="uptime" title={`System uptime: ${formatUptime(uptime)}`}>
            {formatUptime(uptime)}
          </div>
          <div className="user-info" title={`Current user: ${currentUser}`}>
            👤 {currentUser}
          </div>
        </div>

        <div className="system-tray">
          <button className="tray-icon" title="Settings">
            <Settings size={16} />
          </button>
          <button className="tray-icon" title="Power">
            <Power size={16} />
          </button>
        </div>

        <div className="clock">
          <div className="time">{format(currentTime, 'HH:mm:ss')}</div>
          <div className="date">{format(currentTime, 'MMM dd, yyyy')}</div>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;