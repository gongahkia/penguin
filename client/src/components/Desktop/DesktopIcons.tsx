import React from 'react';
import { useDispatch } from 'react-redux';
import { openWindow } from '@/store/slices/windowSlice';
import { getAllApps, getAppConfig } from '@/utils/appRegistry';
import { AppType } from '@/types';

const DesktopIcons: React.FC = () => {
  const dispatch = useDispatch();
  const apps = getAllApps();

  const handleIconClick = (appType: AppType) => {
    const config = getAppConfig(appType);
    const windowId = `${appType}-${Date.now()}`;

    dispatch(openWindow({
      id: windowId,
      title: config.name,
      appType: config.type,
      position: config.defaultPosition,
      size: config.defaultSize,
      isResizable: config.isResizable,
      isDraggable: config.isDraggable,
    }));
  };

  const handleIconDoubleClick = (appType: AppType) => {
    // Double-click behavior - same as single click for now
    handleIconClick(appType);
  };

  return (
    <div className="desktop-icons">
      {apps.map((app) => (
        <div
          key={app.id}
          className="desktop-icon"
          onClick={() => handleIconClick(app.type)}
          onDoubleClick={() => handleIconDoubleClick(app.type)}
          title={app.name}
        >
          <div className="desktop-icon-emoji">{app.icon}</div>
          <div className="desktop-icon-name">{app.name}</div>
        </div>
      ))}
    </div>
  );
};

export default DesktopIcons;