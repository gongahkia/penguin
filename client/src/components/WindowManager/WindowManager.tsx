import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Window from '@/components/Window/Window';
import { getAppComponent } from '@/utils/appRegistry';

const WindowManager: React.FC = () => {
  const windows = useSelector((state: RootState) => state.windows.windows);

  return (
    <div className="window-manager">
      {windows.map((window) => {
        const AppComponent = getAppComponent(window.appType);

        return (
          <Window key={window.id} window={window}>
            <AppComponent windowId={window.id} />
          </Window>
        );
      })}
    </div>
  );
};

export default WindowManager;