import { TerminalCommand, TerminalInstance } from '@/types';
import { commandRegistry, executeCommand as baseExecuteCommand } from './commandRegistry';
import { store } from '@/store';
import { findNodeByPath, createFile, updateFileContent } from '@/store/slices/fileSystemSlice';

// Enhanced command execution with piping and scripting support
export class AdvancedTerminal {
  private variables: Map<string, string> = new Map();
  private aliases: Map<string, string> = new Map();
  private scriptStack: string[] = [];

  constructor() {
    // Initialize default environment variables
    this.variables.set('PS1', '$ ');
    this.variables.set('HOME', '/home/user');
    this.variables.set('USER', 'user');
    this.variables.set('PATH', '/bin:/usr/bin');
  }

  async executeCommand(commandLine: string, terminal: TerminalInstance): Promise<string> {
    const trimmed = commandLine.trim();
    if (!trimmed) return '';

    // Handle variable assignment
    if (this.isVariableAssignment(trimmed)) {
      return this.handleVariableAssignment(trimmed);
    }

    // Handle aliases
    if (trimmed.startsWith('alias ')) {
      return this.handleAlias(trimmed);
    }

    // Check for pipes
    if (trimmed.includes('|')) {
      return this.executePipeCommand(trimmed, terminal);
    }

    // Check for output redirection
    if (trimmed.includes('>')) {
      return this.executeRedirectionCommand(trimmed, terminal);
    }

    // Check for command chaining
    if (trimmed.includes('&&') || trimmed.includes('||') || trimmed.includes(';')) {
      return this.executeChainedCommands(trimmed, terminal);
    }

    // Handle script execution
    if (trimmed.endsWith('.sh') || trimmed.startsWith('./')) {
      return this.executeScript(trimmed, terminal);
    }

    // Expand variables and execute single command
    const expandedCommand = this.expandVariables(trimmed);
    const resolvedCommand = this.resolveAlias(expandedCommand);

    return this.executeSingleCommand(resolvedCommand, terminal);
  }

  private isVariableAssignment(command: string): boolean {
    return /^[A-Za-z_][A-Za-z0-9_]*=/.test(command);
  }

  private handleVariableAssignment(command: string): string {
    const [varName, ...valueParts] = command.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
    this.variables.set(varName, value);
    return '';
  }

  private handleAlias(command: string): string {
    const parts = command.split(' ').slice(1); // Remove 'alias'

    if (parts.length === 0) {
      // List all aliases
      if (this.aliases.size === 0) {
        return 'No aliases defined';
      }

      const aliasList = Array.from(this.aliases.entries())
        .map(([name, value]) => `${name}='${value}'`)
        .join('\n');
      return aliasList;
    }

    const aliasDefinition = parts.join(' ');
    const [name, ...commandParts] = aliasDefinition.split('=');

    if (commandParts.length === 0) {
      // Show specific alias
      const value = this.aliases.get(name);
      return value ? `${name}='${value}'` : `alias: ${name}: not found`;
    }

    const aliasCommand = commandParts.join('=').replace(/^["']|["']$/g, '');
    this.aliases.set(name, aliasCommand);
    return `alias ${name}='${aliasCommand}'`;
  }

  private expandVariables(command: string): string {
    return command.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, varName) => {
      return this.variables.get(varName) || '';
    }).replace(/\$\{([^}]+)\}/g, (match, varName) => {
      return this.variables.get(varName) || '';
    });
  }

  private resolveAlias(command: string): string {
    const parts = command.split(' ');
    const commandName = parts[0];
    const aliasCommand = this.aliases.get(commandName);

    if (aliasCommand) {
      return `${aliasCommand} ${parts.slice(1).join(' ')}`.trim();
    }

    return command;
  }

  private async executePipeCommand(commandLine: string, terminal: TerminalInstance): Promise<string> {
    const commands = commandLine.split('|').map(cmd => cmd.trim());
    let input = '';

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      if (i === 0) {
        // First command
        input = await this.executeSingleCommand(command, terminal);
      } else {
        // Subsequent commands receive input from previous command
        input = await this.executePipedCommand(command, input, terminal);
      }
    }

    return input;
  }

  private async executePipedCommand(command: string, input: string, terminal: TerminalInstance): Promise<string> {
    const parts = command.split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Handle special pipe commands
    switch (commandName) {
      case 'grep': {
        const pattern = args[0];
        if (!pattern) return 'grep: missing pattern';

        const regex = new RegExp(pattern, 'i');
        return input.split('\n')
          .filter(line => regex.test(line))
          .join('\n');
      }

      case 'sort': {
        return input.split('\n')
          .sort((a, b) => a.localeCompare(b))
          .join('\n');
      }

      case 'uniq': {
        const lines = input.split('\n');
        const unique = [...new Set(lines)];
        return unique.join('\n');
      }

      case 'head': {
        const count = args[0] ? parseInt(args[0]) : 10;
        return input.split('\n')
          .slice(0, count)
          .join('\n');
      }

      case 'tail': {
        const count = args[0] ? parseInt(args[0]) : 10;
        const lines = input.split('\n');
        return lines.slice(-count).join('\n');
      }

      case 'wc': {
        const lines = input.split('\n').filter(line => line.length > 0);
        const words = input.split(/\s+/).filter(word => word.length > 0);
        const chars = input.length;

        if (args.includes('-l')) return lines.length.toString();
        if (args.includes('-w')) return words.length.toString();
        if (args.includes('-c')) return chars.toString();

        return `${lines.length} ${words.length} ${chars}`;
      }

      case 'tr': {
        if (args.length < 2) return 'tr: missing operands';
        const from = args[0];
        const to = args[1];
        return input.replace(new RegExp(from, 'g'), to);
      }

      default:
        // For other commands, they receive the input as stdin
        return await this.executeSingleCommand(command, terminal, input);
    }
  }

  private async executeRedirectionCommand(commandLine: string, terminal: TerminalInstance): Promise<string> {
    let [command, outputFile] = commandLine.split('>').map(s => s.trim());
    const isAppend = command.includes('>>');

    if (isAppend) {
      [command, outputFile] = commandLine.split('>>').map(s => s.trim());
    }

    if (!outputFile) {
      return 'Syntax error: missing output file';
    }

    // Execute the command
    const output = await this.executeSingleCommand(command, terminal);

    // Write to file
    const state = store.getState();
    const currentPath = state.fileSystem.currentPath;
    const filePath = outputFile.startsWith('/') ? outputFile : `${currentPath}/${outputFile}`;

    try {
      const existingNode = findNodeByPath(state.fileSystem.root, filePath);

      if (existingNode && existingNode.type === 'file') {
        // File exists
        const newContent = isAppend ? (existingNode.content || '') + '\n' + output : output;
        store.dispatch(updateFileContent({ path: filePath, content: newContent }));
      } else {
        // Create new file
        const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
        const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
        store.dispatch(createFile({ parentPath, name: fileName, content: output }));
      }

      return `Output redirected to ${outputFile}`;
    } catch (error) {
      return `Error writing to file: ${error}`;
    }
  }

  private async executeChainedCommands(commandLine: string, terminal: TerminalInstance): Promise<string> {
    const results: string[] = [];

    // Split by operators while preserving them
    const parts = commandLine.split(/(\s*(?:&&|\|\||\;)\s*)/).filter(part => part.trim());

    let lastExitCode = 0;

    for (let i = 0; i < parts.length; i += 2) {
      const command = parts[i];
      const operator = parts[i + 1];

      if (operator === '&&' && lastExitCode !== 0) {
        break; // Skip rest if previous command failed
      }

      if (operator === '||' && lastExitCode === 0) {
        i += 2; // Skip next command if previous succeeded
        continue;
      }

      try {
        const result = await this.executeSingleCommand(command, terminal);
        results.push(result);
        lastExitCode = 0;
      } catch (error) {
        results.push(`Error: ${error}`);
        lastExitCode = 1;
      }

      if (!operator) break;
    }

    return results.filter(r => r).join('\n');
  }

  private async executeScript(scriptPath: string, terminal: TerminalInstance): Promise<string> {
    const state = store.getState();
    const currentPath = state.fileSystem.currentPath;

    // Handle ./ prefix
    let fullPath = scriptPath;
    if (scriptPath.startsWith('./')) {
      fullPath = `${currentPath}/${scriptPath.substring(2)}`;
    } else if (!scriptPath.startsWith('/')) {
      fullPath = `${currentPath}/${scriptPath}`;
    }

    const scriptNode = findNodeByPath(state.fileSystem.root, fullPath);

    if (!scriptNode) {
      return `Script not found: ${scriptPath}`;
    }

    if (scriptNode.type !== 'file') {
      return `${scriptPath}: is a directory`;
    }

    const scriptContent = scriptNode.content || '';
    const lines = scriptContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));

    const results: string[] = [];

    for (const line of lines) {
      try {
        const result = await this.executeCommand(line, terminal);
        if (result) results.push(result);
      } catch (error) {
        results.push(`Error executing '${line}': ${error}`);
      }
    }

    return results.join('\n');
  }

  private async executeSingleCommand(command: string, terminal: TerminalInstance, stdin?: string): Promise<string> {
    const parts = command.split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check for built-in advanced commands
    if (commandName === 'export') {
      return this.handleExport(args);
    }

    if (commandName === 'env') {
      return this.handleEnv();
    }

    if (commandName === 'history') {
      return this.handleHistory(terminal);
    }

    if (commandName === 'which') {
      return this.handleWhich(args);
    }

    if (commandName === 'find') {
      return this.handleFind(args);
    }

    // For existing commands, use the base command registry
    return await baseExecuteCommand(command, terminal);
  }

  private handleExport(args: string[]): string {
    if (args.length === 0) {
      // List all exported variables
      const exported = Array.from(this.variables.entries())
        .map(([name, value]) => `export ${name}="${value}"`)
        .join('\n');
      return exported || 'No exported variables';
    }

    const assignment = args.join(' ');
    if (assignment.includes('=')) {
      const [varName, ...valueParts] = assignment.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      this.variables.set(varName, value);
      return '';
    } else {
      // Export existing variable
      const varName = args[0];
      if (this.variables.has(varName)) {
        return `export ${varName}="${this.variables.get(varName)}"`;
      } else {
        return `export: ${varName}: not found`;
      }
    }
  }

  private handleEnv(): string {
    return Array.from(this.variables.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('\n');
  }

  private handleHistory(terminal: TerminalInstance): string {
    return terminal.history
      .map((cmd, index) => `${(index + 1).toString().padStart(4)} ${cmd}`)
      .join('\n');
  }

  private handleWhich(args: string[]): string {
    if (args.length === 0) {
      return 'which: missing command';
    }

    const commandName = args[0];

    if (commandRegistry[commandName]) {
      return `/bin/${commandName}`;
    }

    if (this.aliases.has(commandName)) {
      return `${commandName}: aliased to '${this.aliases.get(commandName)}'`;
    }

    return `which: ${commandName}: not found`;
  }

  private handleFind(args: string[]): string {
    const state = store.getState();
    let searchPath = state.fileSystem.currentPath;
    let namePattern = '';

    // Parse find arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && i + 1 < args.length) {
        namePattern = args[i + 1];
        i++; // Skip next argument
      } else if (!searchPath || searchPath === state.fileSystem.currentPath) {
        searchPath = args[i];
      }
    }

    if (!namePattern) {
      return 'find: missing -name pattern';
    }

    const results: string[] = [];
    const searchNode = findNodeByPath(state.fileSystem.root, searchPath);

    if (!searchNode) {
      return `find: ${searchPath}: No such file or directory`;
    }

    this.findFiles(searchNode, namePattern, results);

    return results.length > 0 ? results.join('\n') : 'No files found';
  }

  private findFiles(node: any, pattern: string, results: string[], currentPath = ''): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
    const nodePath = currentPath || node.path;

    if (regex.test(node.name)) {
      results.push(nodePath);
    }

    if (node.children) {
      for (const child of node.children) {
        this.findFiles(child, pattern, results, child.path);
      }
    }
  }

  // Get environment variable
  getVariable(name: string): string | undefined {
    return this.variables.get(name);
  }

  // Set environment variable
  setVariable(name: string, value: string): void {
    this.variables.set(name, value);
  }

  // Get all variables
  getAllVariables(): Map<string, string> {
    return new Map(this.variables);
  }

  // Get all aliases
  getAllAliases(): Map<string, string> {
    return new Map(this.aliases);
  }
}

// Global instance
export const advancedTerminal = new AdvancedTerminal();