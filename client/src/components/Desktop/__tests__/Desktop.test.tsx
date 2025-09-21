import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Desktop from '../Desktop';
import userSlice from '@/store/slices/userSlice';

const mockStore = configureStore({
  reducer: {
    user: userSlice,
    windows: () => ({ windows: [] }),
    terminal: () => ({ history: [], currentInput: '' }),
    fileSystem: () => ({ files: {}, currentPath: '/' }),
    system: () => ({ notifications: [] })
  },
  preloadedState: {
    user: {
      profile: { username: 'testuser', email: 'test@example.com' },
      preferences: {
        wallpaper: '/images/default-wallpaper.jpg',
        theme: 'light'
      },
      isAuthenticated: true
    }
  }
});

jest.mock('@/components/Taskbar/Taskbar', () => {
  return function MockTaskbar() {
    return <div data-testid="taskbar">Taskbar</div>;
  };
});

jest.mock('../DesktopIcons', () => {
  return function MockDesktopIcons() {
    return <div data-testid="desktop-icons">Desktop Icons</div>;
  };
});

describe('Desktop Component', () => {
  it('renders desktop with wallpaper background', () => {
    render(
      <Provider store={mockStore}>
        <Desktop />
      </Provider>
    );

    const desktopElement = document.querySelector('.desktop');
    expect(desktopElement).toBeInTheDocument();
    expect(desktopElement).toHaveStyle({
      backgroundImage: 'url(/images/default-wallpaper.jpg)'
    });
  });

  it('renders desktop icons and taskbar', () => {
    render(
      <Provider store={mockStore}>
        <Desktop />
      </Provider>
    );

    expect(screen.getByTestId('desktop-icons')).toBeInTheDocument();
    expect(screen.getByTestId('taskbar')).toBeInTheDocument();
  });
});