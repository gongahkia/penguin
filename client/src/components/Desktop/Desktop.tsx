import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Taskbar from '@/components/Taskbar/Taskbar';
import DesktopIcons from './DesktopIcons';
import './Desktop.css';

const Desktop: React.FC = () => {
  const { wallpaper } = useSelector((state: RootState) => state.user.preferences);

  return (
    <div
      className="desktop"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <DesktopIcons />
      <Taskbar />
    </div>
  );
};

export default Desktop;