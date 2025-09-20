# Prompt to Claude Code

```txt
## Project Overview  
Penguin is a full-stack web application delivering an interactive custom operating system simulation optimized for the browser. It features a graphical user interface with a home screen, multiple simulated apps, and a terminal interface supporting programmable commands. Unlike specific OS emulators, Penguin is its own distinct OS environment inspired by design principles of classic and modern systems, providing users with a sandboxed experience akin to a lightweight Linux distro running in a web app. It includes full app lifecycle management, user state persistence, and cloud deployment.

## Key Features  
- Custom OS environment with its own unique GUI design and interaction models.  
- Interactive home screen with icons, taskbar/control center, and draggable/resizable windows.  
- Simulated apps, including text editor, file explorer, media player, and terminal shell.  
- Terminal interface with an extensible command set for system control and scripting.  
- Full keyboard and mouse support capturing familiar OS interactions.  
- Responsive UI adapting to desktop and tablet form factors.  
- Persistent user session state stored locally and optionally synced to cloud storage.  
- Backend API enabling state management, command processing, and multi-user support.  
- Automated build and deployment pipeline for cloud hosting.

## Technical Specifications  

### Frontend  
- Built with React 18+ and TypeScript.  
- State management via Redux Toolkit or React Context API.  
- Styled with CSS modules or Tailwind CSS to create a modern but retro-inspired UI.  
- Window management system supporting multi-window concurrency, layering, and native-like behaviors.  
- Fully programmable terminal component with command registry and prompt customization.  

### Backend  
- Node.js with Express for API handling user data, terminal command execution, and app management.  
- Support for RESTful or WebSocket communication for realtime interactions.  
- Database solution (MongoDB, PostgreSQL, or SQLite) for user config, sessions, and storage.  

### Deployment  
- Docker-based containerization ready for cloud deployment on platforms like Vercel, AWS, or Netlify.  
- Continuous integration and delivery using GitHub Actions or equivalent tooling.  
- Environment configuration for staging and production environments.  

## Example Terminal Commands  
- `help`: Lists available commands  
- `open <app>`: Launch a simulated app by name  
- `list`: Display currently open apps/windows  
- `close <app>`: Close specified app window  
- `echo <message>`: Output a given message  
- Custom commands scripted by users or admins for OS interaction  

## Deliverables  
- Complete, modular full-stack codebase with frontend, backend, configs, and tests.  
- Comprehensive inline documentation and user/developer guides.  
- Automated test suites covering UI and API endpoints.  
- Deployment-ready configurations and scripts.  

## Development Environment  
- Node.js 20+  
- React 18+, Redux Toolkit, TypeScript  
- Express.js backend  
- Docker and Container orchestration  
- Jest and React Testing Library  

## Notes for Claude Code  
- Generate entire multi-file repository from scratch including build, test, and deployment infrastructure.  
- Implement custom OS UI components and state management.  
- Create terminal shell with programmable command support.  
- Develop backend APIs for state persistence and command processing.  
- Write detailed README and inline code comments for maintainability.  
```

# Sample Linkedin Post

```txt
LinkedIn Post Draft for Following Tuesday
Thrilled to announce Penguin — a full-stack custom OS simulation running entirely in the web browser! 🖥️✨

This sandboxed OS is designed from the ground up, featuring a unique GUI, multi-window app management, and a powerful programmable terminal interface. Think of it like your own Linux distro, but lightweight and accessible anywhere, anytime.

Built with modern stacks like React, TypeScript, and Node.js, this project blends nostalgia with innovation to deliver a flexible platform for exploring OS concepts and productivity in a sleek web app.

Looking forward to sharing more soon! #WebDevelopment #ReactJS #NodeJS #TypeScript #CustomOS #LinuxInspired #Innovation
```

[![](https://img.shields.io/badge/penguin_1.0.0-passing-green)](https://github.com/gongahkia/penguin/releases/tag/1.0.0) 

# `Penguin`

...

## Rationale

...

## Stack

...

## Screenshots

...

## Usage

...

## Support

...

## Architecture

...

## Legal

...

## Reference

...
