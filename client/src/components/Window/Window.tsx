import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Rnd } from 'react-rnd';
import {
  closeWindow,
  minimizeWindow,
  maximizeWindow,
  focusWindow,
  updateWindowPosition,
  updateWindowSize
} from '@/store/slices/windowSlice';
import { WindowState } from '@/types';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ window, children }) => {
  const dispatch = useDispatch();
  const rndRef = useRef<Rnd>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClose = useCallback(() => {
    dispatch(closeWindow(window.id));
  }, [dispatch, window.id]);

  const handleMinimize = useCallback(() => {
    dispatch(minimizeWindow(window.id));
  }, [dispatch, window.id]);

  const handleMaximize = useCallback(() => {
    dispatch(maximizeWindow(window.id));
  }, [dispatch, window.id]);

  const handleFocus = useCallback(() => {
    if (!window.isActive) {
      dispatch(focusWindow(window.id));
    }
  }, [dispatch, window.id, window.isActive]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    handleFocus();
  }, [handleFocus]);

  const handleDragStop = useCallback((_e: any, d: any) => {
    setIsDragging(false);
    dispatch(updateWindowPosition({
      id: window.id,
      position: { x: d.x, y: d.y }
    }));
  }, [dispatch, window.id]);

  const handleResizeStop = useCallback((_e: any, _direction: any, ref: any, _delta: any, position: any) => {
    dispatch(updateWindowSize({
      id: window.id,
      size: { width: ref.offsetWidth, height: ref.offsetHeight }
    }));
    dispatch(updateWindowPosition({
      id: window.id,
      position: { x: position.x, y: position.y }
    }));
  }, [dispatch, window.id]);

  // Handle window focus on click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;
      const windowElement = rndRef.current?.getSelfElement();

      if (windowElement?.contains(target) && !window.isActive) {
        handleFocus();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [handleFocus, window.isActive]);

  if (window.isMinimized) {
    return null;
  }

  const windowClass = `window ${window.isMaximized ? 'maximized' : ''}`;

  return (
    <Rnd
      ref={rndRef}
      size={{
        width: window.isMaximized ? '100vw' : window.size.width,
        height: window.isMaximized ? 'calc(100vh - 48px)' : window.size.height
      }}
      position={{
        x: window.isMaximized ? 0 : window.position.x,
        y: window.isMaximized ? 0 : window.position.y
      }}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={window.isMaximized || !window.isDraggable}
      enableResizing={window.isResizable && !window.isMaximized}
      dragHandleClassName="window-header"
      className={windowClass}
      style={{
        zIndex: window.zIndex,
        opacity: isDragging ? 0.8 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s ease'
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
    >
      <div className="window-header">
        <div className="window-title">{window.title}</div>
        <div className="window-controls">
          <button
            className="window-control minimize"
            onClick={handleMinimize}
            title="Minimize"
          >
            <Minus size={8} />
          </button>
          <button
            className="window-control maximize"
            onClick={handleMaximize}
            title={window.isMaximized ? "Restore" : "Maximize"}
          >
            <Square size={8} />
          </button>
          <button
            className="window-control close"
            onClick={handleClose}
            title="Close"
          >
            <X size={8} />
          </button>
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
    </Rnd>
  );
};

export default Window;