# Penguin OS

**Interactive Custom Operating System Simulation for the Browser**

[![Version](https://img.shields.io/badge/penguin_1.0.0-passing-green)](https://github.com/gongahkia/penguin/releases/tag/1.0.0)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/gongahkia/penguin/actions)

Penguin OS is a full-stack web application that delivers an immersive operating system experience directly in your browser. Built with modern web technologies, it provides a complete desktop environment with applications, file system, terminal, and user management.

![Penguin OS Desktop](docs/images/desktop.png)

## 🚀 Features

### 🖥️ Complete Desktop Environment
- **Interactive GUI** with draggable, resizable windows
- **Multi-window management** with taskbar and system tray
- **Desktop with app icons** and right-click context menus
- **Notification system** for real-time updates

### 📁 File System Simulation
- **Virtual file system** with directories and files
- **File operations**: create, edit, delete, rename, copy, paste
- **File explorer** with navigation and file management
- **Persistent storage** synced with user accounts

### 💻 Terminal Interface
- **Full-featured terminal** with command history and autocomplete
- **Extensible command system** with 20+ built-in commands
- **Command registry** for easy extension
- **Real-time command execution**

### 📝 Built-in Applications
- **Text Editor** - Full-featured editor with syntax highlighting
- **File Explorer** - Navigate and manage your virtual file system
- **Calculator** - Standard calculator with arithmetic operations
- **Media Player** - Audio player with playlist support
- **Notepad** - Simple note-taking application
- **Settings** - Customize themes, preferences, and system options

### 🔐 User Management
- **Secure authentication** with JWT tokens
- **Personal file systems** for each user
- **Customizable preferences** (themes, wallpapers, settings)
- **Session management** with automatic save/restore

## 🛠️ Technical Stack

### Frontend
- **React 18+** with TypeScript
- **Redux Toolkit** for state management
- **React DnD** for drag and drop
- **React RND** for resizable windows
- **CSS Modules** for styling
- **Vite** for building

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing

### DevOps
- **Docker** containerization
- **GitHub Actions** CI/CD
- **Nginx** web server
- **Docker Compose** orchestration

## 📋 Prerequisites

- Node.js 20+
- MongoDB 7.0+
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/gongahkia/penguin.git
cd penguin

# Start with Docker Compose
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Local Development

```bash
# Clone and install
git clone https://github.com/gongahkia/penguin.git
cd penguin
npm run install:all

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your settings

# Start MongoDB
docker run -d -p 27017:27017 --name penguin-mongo mongo:7.0

# Start development servers
npm run dev
```

## 📖 Usage

### Getting Started
1. Register a new account or login
2. Explore the desktop by clicking app icons
3. Open terminal to run commands
4. Customize through Settings app

### Terminal Commands

```bash
# Navigation
ls                    # List files
cd /home/user         # Change directory
pwd                   # Current directory

# File Operations
mkdir projects        # Create directory
touch hello.txt       # Create file
cat hello.txt         # View file
rm hello.txt          # Delete file

# Applications
open texteditor       # Launch text editor
open fileexplorer     # Launch file explorer
open calculator       # Launch calculator

# System
help                  # Show commands
clear                 # Clear terminal
whoami                # Current user
uptime                # System uptime
```

### Window Management
- **Drag** windows around desktop
- **Resize** by dragging edges/corners
- **Minimize/Maximize** with window controls
- **Multi-task** with multiple apps open

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/penguin-os
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:3000
```

### Customization Options
- **Themes**: Light, Dark, Auto-detect
- **Wallpapers**: Upload custom backgrounds
- **Terminal**: Multiple color schemes
- **Fonts**: Adjustable sizes

## 🧪 Testing

```bash
# Run all tests
npm test

# Individual test suites
cd client && npm test
cd server && npm test

# Coverage reports
npm run test:coverage
```

## 🚀 Deployment

### Production Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Platforms
Ready for deployment on:
- AWS (ECS, EKS, Elastic Beanstalk)
- Google Cloud (Cloud Run, GKE)
- Azure (Container Instances, AKS)
- Vercel/Netlify + Railway/Heroku

## 📂 Project Structure

```
penguin/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── apps/          # Application components
│   │   ├── store/         # Redux store
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   ├── public/            # Static assets
│   └── Dockerfile         # Client container
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Server utilities
│   └── Dockerfile         # Server container
├── shared/                # Shared types/utils
├── docs/                  # Documentation
├── tests/                 # Test suites
├── docker-compose.yml     # Development setup
└── .github/workflows/     # CI/CD pipeline
```

## 🎯 Roadmap

- [ ] **Plugin System** - Custom app development
- [ ] **Collaborative Features** - Multi-user workspaces
- [ ] **Mobile Support** - Touch-optimized interface
- [ ] **Advanced Terminal** - Shell scripting support
- [ ] **Cloud Storage** - External file system integration
- [ ] **Performance Mode** - Optimized for low-end devices

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📊 Performance

- **Fast startup** with code splitting
- **Efficient rendering** with React optimizations
- **Minimal memory usage** with proper state management
- **Responsive design** for all screen sizes

## 🐛 Known Issues

- Terminal autocomplete needs improvement
- File system performance with large directories
- Mobile touch gestures need refinement

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Inspired by classic operating systems
- Built with modern web technologies
- Community-driven development
- Special thanks to all contributors

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/gongahkia/penguin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gongahkia/penguin/discussions)
- **Email**: support@penguin-os.dev

---

**Experience a complete operating system in your browser!** 🐧✨

Made with ❤️ by the Penguin OS Team