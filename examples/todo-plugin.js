/* MANIFEST
{
  "id": "todo-list-plugin",
  "name": "Todo List",
  "version": "1.0.0",
  "description": "A simple todo list application to help you stay organized",
  "author": "Penguin OS Team",
  "icon": "📝",
  "permissions": [
    {
      "type": "storage",
      "description": "Store and retrieve todo items"
    },
    {
      "type": "notifications",
      "description": "Show notifications for completed tasks"
    }
  ],
  "entryPoint": "TodoPlugin",
  "minPenguinVersion": "1.0.0",
  "tags": ["productivity", "tasks", "organization"]
}
*/

class TodoPlugin {
  constructor() {
    this.context = null;
    this.windowId = null;
    this.todos = [];
  }

  async activate(context) {
    this.context = context;
    console.log('Todo Plugin activated!');

    // Load saved todos
    await this.loadTodos();

    // Register a shortcut to open the todo list
    await this.context.api.ui.registerShortcut('ctrl+shift+t', () => {
      this.openTodoWindow();
    });

    // Log activation
    this.context.logger.log('Todo Plugin successfully activated');
  }

  async deactivate() {
    if (this.windowId) {
      await this.context.api.system.closeWindow(this.windowId);
    }
    console.log('Todo Plugin deactivated!');
  }

  async loadTodos() {
    try {
      const savedTodos = await this.context.storage.get('todos');
      this.todos = savedTodos || [];
    } catch (error) {
      this.context.logger.error('Failed to load todos:', error);
      this.todos = [];
    }
  }

  async saveTodos() {
    try {
      await this.context.storage.set('todos', this.todos);
    } catch (error) {
      this.context.logger.error('Failed to save todos:', error);
    }
  }

  async openTodoWindow() {
    if (this.windowId) {
      // Window already open, just focus it
      return;
    }

    try {
      this.windowId = await this.context.api.system.openWindow({
        title: 'Todo List',
        component: this.createTodoComponent(),
        size: { width: 400, height: 500 },
        position: { x: 200, y: 150 }
      });
    } catch (error) {
      this.context.logger.error('Failed to open todo window:', error);
    }
  }

  createTodoComponent() {
    // Since we're in a sandboxed environment, we'll create a simple HTML interface
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      height: 100%;
      display: flex;
      flex-direction: column;
    `;

    // Header
    const header = document.createElement('div');
    header.innerHTML = '<h2 style="margin: 0 0 20px 0; color: #333;">📝 Todo List</h2>';
    container.appendChild(header);

    // Add todo form
    const form = document.createElement('form');
    form.style.cssText = 'display: flex; gap: 8px; margin-bottom: 20px;';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add a new todo...';
    input.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    `;

    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.type = 'submit';
    addButton.style.cssText = `
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    form.appendChild(input);
    form.appendChild(addButton);
    container.appendChild(form);

    // Todo list
    const todoList = document.createElement('div');
    todoList.style.cssText = 'flex: 1; overflow-y: auto;';
    container.appendChild(todoList);

    // Event handlers
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        this.addTodo(text, todoList);
        input.value = '';
      }
    });

    // Initial render
    this.renderTodos(todoList);

    return container;
  }

  addTodo(text, todoList) {
    const todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date()
    };

    this.todos.push(todo);
    this.saveTodos();
    this.renderTodos(todoList);
  }

  toggleTodo(id, todoList) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.renderTodos(todoList);

      // Show notification when completing a task
      if (todo.completed) {
        this.context.api.system.showNotification(`✅ Completed: ${todo.text}`);
      }
    }
  }

  deleteTodo(id, todoList) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.renderTodos(todoList);
  }

  renderTodos(todoList) {
    todoList.innerHTML = '';

    if (this.todos.length === 0) {
      todoList.innerHTML = '<p style="color: #999; text-align: center; margin-top: 40px;">No todos yet. Add one above!</p>';
      return;
    }

    this.todos.forEach(todo => {
      const todoItem = document.createElement('div');
      todoItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #eee;
        border-radius: 6px;
        margin-bottom: 8px;
        background: ${todo.completed ? '#f8f9fa' : 'white'};
      `;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => this.toggleTodo(todo.id, todoList));

      const text = document.createElement('span');
      text.textContent = todo.text;
      text.style.cssText = `
        flex: 1;
        text-decoration: ${todo.completed ? 'line-through' : 'none'};
        color: ${todo.completed ? '#999' : '#333'};
      `;

      const deleteButton = document.createElement('button');
      deleteButton.textContent = '🗑️';
      deleteButton.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        border-radius: 4px;
      `;
      deleteButton.addEventListener('click', () => this.deleteTodo(todo.id, todoList));

      todoItem.appendChild(checkbox);
      todoItem.appendChild(text);
      todoItem.appendChild(deleteButton);
      todoList.appendChild(todoItem);
    });
  }
}

// Export the plugin
module.exports = new TodoPlugin();