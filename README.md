[![](https://img.shields.io/badge/penguin_1.0.0-passing-green)](https://github.com/gongahkia/penguin/releases/tag/1.0.0)

# `Penguin`

Interactive Custom Operating System Simulation for the Browser with [Complete Desktop Environment](#stack), [Virtual File System](#usage), and [Multi-user Workspaces](#architecture).

## Rationale

Ever wanted to experience a full desktop operating system without leaving your browser? What if you could run multiple applications, manage files, and even collaborate with others in real-time, all within a web application?

I built [Penguin](https://github.com/gongahkia/penguin) to scratch that itch. Takeaways [here](#other-notes).

## Stack

* *Frontend*: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Redux Toolkit](https://redux-toolkit.js.org/), [Vite](https://vite.dev/)
* *Backend*: [Express.js](https://expressjs.com/), [Node.js](https://nodejs.org/), [Socket.IO](https://socket.io/)
* *Database*: [MongoDB](https://www.mongodb.com/), [Mongoose](https://mongoosejs.com/)
* *Auth*: [JWT](https://jwt.io/), [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
* *Package*: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)
* *Testing*: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Playwright](https://playwright.dev/)

## Usage

The below instructions are for locally hosting `Penguin`.

1. First execute the below.

```console
$ git clone https://github.com/gongahkia/penguin && cd penguin
```

2. Configure environment and dependencies.

```console
$ cp server/.env.example server/.env
$ npm run install:all
```

3. Start with Docker Compose (recommended) or run locally.

```console
# Docker approach
$ docker-compose up -d

# Local development approach
$ docker run -d -p 27017:27017 --name penguin-mongo mongo:7.0
$ npm run dev
```

4. Access the application at `http://localhost:3000`

## Endpoints

For testing the [Node.js backend](./server/) API directly.

1. First run the backend server.

```console
$ cd server && npm run dev
```

2. Use `curl` to test API endpoints.

| Endpoint | Method | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | User registration | `curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"username": "user", "email": "user@example.com", "password": "password123"}'` |
| `/api/auth/login` | POST | User authentication | `curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email": "user@example.com", "password": "password123"}'` |
| `/api/files` | GET | Get user files | `curl -X GET http://localhost:3001/api/files -H "Authorization: Bearer <JWT_TOKEN>"` |
| `/api/files` | POST | Create file/folder | `curl -X POST http://localhost:3001/api/files -H "Authorization: Bearer <JWT_TOKEN>" -H "Content-Type: application/json" -d '{"name": "test.txt", "type": "file", "content": "Hello World"}'` |

## Architecture

### Overview

```mermaid
graph TD
    subgraph Browser
        User[End User] -->|Interacts with| Desktop[Desktop Component];
        Desktop -->|Manages| WindowManager[Window Manager];
        WindowManager -->|Renders| Apps[Applications];
        Apps -->|Uses| FileSystem[Virtual File System];
        Apps -->|Executes| Terminal[Terminal Interface];
        Terminal -->|Processes| Commands[Command Registry];
        Desktop -->|Manages| Auth[Authentication];
    end

    subgraph "Frontend Architecture"
        Redux[Redux Store] -->|State Management| Desktop;
        SocketClient[Socket.IO Client] -->|Real-time Updates| Desktop;
        ReactDnD[React DnD] -->|Drag & Drop| WindowManager;
        ReactRND[React RND] -->|Resizable Windows| WindowManager;
    end

    subgraph "Backend API"
        Express[Express.js Server] -->|Routes| AuthRoutes[Auth Routes];
        Express -->|Routes| FileRoutes[File Routes];
        Express -->|Routes| UserRoutes[User Routes];
        AuthRoutes -->|Validates| JWT[JWT Middleware];
        FileRoutes -->|Queries| MongoDB[(MongoDB)];
        SocketServer[Socket.IO Server] -->|Real-time| Express;
    end

    subgraph "Data Flow"
        Auth -->|POST /api/auth/login| AuthRoutes;
        FileSystem -->|API Calls| FileRoutes;
        Commands -->|File Operations| FileRoutes;
        SocketClient -.->|WebSocket| SocketServer;
        MongoDB -->|User Data| FileRoutes;
        JWT -->|Validates Token| MongoDB;
    end

    %% Styling
    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Desktop fill:#bbf,stroke:#333,stroke-width:2px
    style Express fill:#f80,stroke:#333,stroke-width:2px
    style MongoDB fill:#9f9,stroke:#333,stroke-width:2px
    style Redux fill:#9b59b6,stroke:#333,stroke-width:2px
    style SocketServer fill:#3498db,stroke:#333,stroke-width:2px
```

### Frontend Components

```mermaid
flowchart TD
    subgraph "React Application"
        App[App Component] --> Router[React Router];
        Router --> LoginPage[Login Page];
        Router --> DesktopPage[Desktop Page];

        DesktopPage --> Desktop[Desktop Component];
        Desktop --> Taskbar[Taskbar];
        Desktop --> WindowManager[Window Manager];
        Desktop --> NotificationSystem[Notification System];

        WindowManager --> AppWindow[App Window];
        AppWindow --> TextEditor[Text Editor];
        AppWindow --> FileExplorer[File Explorer];
        AppWindow --> Terminal[Terminal];
        AppWindow --> Calculator[Calculator];
        AppWindow --> MediaPlayer[Media Player];
        AppWindow --> Settings[Settings];

        Terminal --> CommandProcessor[Command Processor];
        CommandProcessor --> FileCommands[File Commands];
        CommandProcessor --> SystemCommands[System Commands];
        CommandProcessor --> AppCommands[App Commands];
    end

    subgraph "State Management"
        ReduxStore[Redux Store] --> AuthSlice[Auth Slice];
        ReduxStore --> FileSystemSlice[File System Slice];
        ReduxStore --> WindowSlice[Window Slice];
        ReduxStore --> TerminalSlice[Terminal Slice];
        ReduxStore --> SettingsSlice[Settings Slice];
    end

    subgraph "Services"
        APIService[API Service] --> AuthAPI[Auth API];
        APIService --> FileAPI[File API];
        SocketService[Socket Service] --> RealTimeUpdates[Real-time Updates];
        LocalStorage[Local Storage] --> UserPreferences[User Preferences];
    end

    Desktop --> ReduxStore;
    Terminal --> SocketService;
    FileExplorer --> APIService;
    Settings --> LocalStorage;

    style App fill:#2ecc71,stroke:#27ae60
    style Desktop fill:#3498db,stroke:#2980b9
    style ReduxStore fill:#9b59b6,stroke:#8e44ad
    style APIService fill:#e74c3c,stroke:#c0392b
```

## Other notes

Building an operating system in the browser taught me the importance of state management, real-time synchronization, and modular architecture. [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) provides excellent tooling for complex applications.