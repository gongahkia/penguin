import { TerminalInstance } from '@/types';
import { commandRegistry, executeCommand as basicExecuteCommand } from './commandRegistry';

interface TerminalVariable {
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
  readonly?: boolean;
}

interface TerminalScript {
  name: string;
  content: string;
  variables: Record<string, TerminalVariable>;
}

interface PipelineStage {
  command: string;
  args: string[];
  input?: string;
}

class AdvancedTerminalProcessor {
  private variables = new Map<string, TerminalVariable>();
  private scripts = new Map<string, TerminalScript>();
  private aliases = new Map<string, string>();
  private history: string[] = [];
  private historyIndex = -1;

  constructor() {
    this.initializeBuiltInVariables();
    this.initializeAdvancedCommands();
  }

  private initializeBuiltInVariables() {
    // Built-in system variables
    this.setVariable('USER', 'user', 'string', true);
    this.setVariable('HOME', '/home/user', 'string', true);
    this.setVariable('PATH', '/bin:/usr/bin:/usr/local/bin', 'string', true);
    this.setVariable('SHELL', '/bin/bash', 'string', true);
    this.setVariable('PWD', '/', 'string', false);
    this.setVariable('OLDPWD', '/', 'string', false);
  }

  private initializeAdvancedCommands() {
    // Add advanced commands to the registry
    commandRegistry.export = {
      name: 'export',
      description: 'Sets environment variables',
      usage: 'export VAR=value',
      handler: (args) => this.handleExport(args)
    };

    commandRegistry.unset = {
      name: 'unset',
      description: 'Unsets environment variables',
      usage: 'unset VAR',
      handler: (args) => this.handleUnset(args)
    };

    commandRegistry.env = {
      name: 'env',
      description: 'Shows environment variables',
      usage: 'env',
      handler: () => this.handleEnv()
    };

    commandRegistry.alias = {
      name: 'alias',
      description: 'Creates command aliases',
      usage: 'alias name=command',
      handler: (args) => this.handleAlias(args)
    };

    commandRegistry.unalias = {
      name: 'unalias',
      description: 'Removes command aliases',
      usage: 'unalias name',
      handler: (args) => this.handleUnalias(args)
    };

    commandRegistry.history = {
      name: 'history',
      description: 'Shows command history',
      usage: 'history',
      handler: () => this.handleHistory()
    };

    commandRegistry.grep = {
      name: 'grep',
      description: 'Search text patterns',
      usage: 'grep pattern [file]',
      handler: (args) => this.handleGrep(args)
    };

    commandRegistry.sort = {
      name: 'sort',
      description: 'Sort lines of text',
      usage: 'sort [file]',
      handler: (args) => this.handleSort(args)
    };

    commandRegistry.wc = {
      name: 'wc',
      description: 'Count lines, words, characters',
      usage: 'wc [file]',
      handler: (args) => this.handleWc(args)
    };

    commandRegistry.head = {
      name: 'head',
      description: 'Show first lines of file',
      usage: 'head [-n lines] [file]',
      handler: (args) => this.handleHead(args)
    };

    commandRegistry.tail = {
      name: 'tail',
      description: 'Show last lines of file',
      usage: 'tail [-n lines] [file]',
      handler: (args) => this.handleTail(args)
    };

    commandRegistry.script = {
      name: 'script',
      description: 'Execute or manage scripts',
      usage: 'script [create|run|list|delete] [name]',
      handler: (args) => this.handleScript(args)
    };

    commandRegistry.if = {
      name: 'if',
      description: 'Conditional execution',
      usage: 'if condition; then command; fi',
      handler: (args) => this.handleIf(args)
    };

    commandRegistry.for = {
      name: 'for',
      description: 'Loop execution',
      usage: 'for var in list; do command; done',
      handler: (args) => this.handleFor(args)
    };
  }

  async executeCommand(commandLine: string, terminal: TerminalInstance): Promise<string> {
    // Add to history
    if (commandLine.trim()) {
      this.history.push(commandLine);
      this.historyIndex = this.history.length;
    }

    // Handle piping
    if (commandLine.includes('|')) {
      return this.executePipeline(commandLine, terminal);
    }

    // Handle redirection
    if (commandLine.includes('>') || commandLine.includes('>>')) {
      return this.executeWithRedirection(commandLine, terminal);
    }

    // Handle variable substitution
    const expandedCommand = this.expandVariables(commandLine);

    // Handle aliases
    const resolvedCommand = this.resolveAliases(expandedCommand);

    // Handle conditional execution (&&, ||)
    if (resolvedCommand.includes('&&') || resolvedCommand.includes('||')) {
      return this.executeConditional(resolvedCommand, terminal);
    }

    // Handle background execution (&)
    if (resolvedCommand.endsWith('&')) {
      return this.executeBackground(resolvedCommand.slice(0, -1).trim(), terminal);
    }

    // Execute single command
    return this.executeSingleCommand(resolvedCommand, terminal);
  }

  private async executePipeline(commandLine: string, terminal: TerminalInstance): Promise<string> {
    const stages = this.parsePipeline(commandLine);
    let output = '';

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];

      if (i > 0) {
        stage.input = output;
      }

      try {
        output = await this.executeStage(stage, terminal);
      } catch (error) {
        return `Pipeline error at stage ${i + 1}: ${error}`;
      }
    }

    return output;
  }

  private parsePipeline(commandLine: string): PipelineStage[] {
    const commands = commandLine.split('|').map(cmd => cmd.trim());

    return commands.map(cmd => {
      const parts = this.parseCommand(cmd);
      return {
        command: parts[0],
        args: parts.slice(1)
      };
    });
  }

  private async executeStage(stage: PipelineStage, terminal: TerminalInstance): Promise<string> {
    // Handle built-in pipeline commands
    switch (stage.command) {
      case 'grep':
        return this.pipeGrep(stage.args, stage.input || '');
      case 'sort':
        return this.pipeSort(stage.args, stage.input || '');
      case 'wc':
        return this.pipeWc(stage.args, stage.input || '');
      case 'head':
        return this.pipeHead(stage.args, stage.input || '');
      case 'tail':
        return this.pipeTail(stage.args, stage.input || '');
      default:
        // Execute regular command and pass input if needed
        const fullCommand = `${stage.command} ${stage.args.join(' ')}`;
        return await this.executeSingleCommand(fullCommand, terminal);
    }
  }

  private async executeWithRedirection(commandLine: string, terminal: TerminalInstance): Promise<string> {
    const redirectMatch = commandLine.match(/(.+?)\s*(>>?)\s*(.+)/);
    if (!redirectMatch) {
      return 'Invalid redirection syntax';
    }

    const [, command, operator, target] = redirectMatch;
    const append = operator === '>>';

    try {
      const output = await this.executeSingleCommand(command.trim(), terminal);

      // In a real implementation, this would write to the file system
      // For now, we'll simulate it
      console.log(`${append ? 'Appending' : 'Writing'} to ${target}: ${output}`);

      return `Output ${append ? 'appended' : 'written'} to ${target}`;
    } catch (error) {
      return `Redirection error: ${error}`;
    }
  }

  private async executeConditional(commandLine: string, terminal: TerminalInstance): Promise<string> {
    let parts: string[];
    let isOr = false;

    if (commandLine.includes('&&')) {
      parts = commandLine.split('&&').map(p => p.trim());
    } else {
      parts = commandLine.split('||').map(p => p.trim());
      isOr = true;
    }

    let lastResult = '';
    let lastSuccess = true;

    for (const part of parts) {
      if (isOr && lastSuccess) {
        break; // Skip remaining commands in OR chain if previous succeeded
      }
      if (!isOr && !lastSuccess) {
        break; // Skip remaining commands in AND chain if previous failed
      }

      try {
        lastResult = await this.executeSingleCommand(part, terminal);
        lastSuccess = !lastResult.toLowerCase().includes('error');
      } catch (error) {
        lastSuccess = false;
        lastResult = `Error: ${error}`;
        if (!isOr) break;
      }
    }

    return lastResult;
  }

  private async executeBackground(commandLine: string, terminal: TerminalInstance): Promise<string> {
    // Simulate background execution
    setTimeout(async () => {
      try {
        await this.executeSingleCommand(commandLine, terminal);
      } catch (error) {
        console.error('Background process error:', error);
      }
    }, 0);

    return `Started background process: ${commandLine}`;
  }

  private async executeSingleCommand(commandLine: string, terminal: TerminalInstance): Promise<string> {
    return await basicExecuteCommand(commandLine, terminal);
  }

  private expandVariables(commandLine: string): string {
    return commandLine.replace(/\$([A-Z_][A-Z0-9_]*)/g, (match, varName) => {
      const variable = this.variables.get(varName);
      return variable ? variable.value : match;
    });
  }

  private resolveAliases(commandLine: string): string {
    const parts = this.parseCommand(commandLine);
    const command = parts[0];

    if (this.aliases.has(command)) {
      const alias = this.aliases.get(command)!;
      return `${alias} ${parts.slice(1).join(' ')}`;
    }

    return commandLine;
  }

  private parseCommand(commandLine: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < commandLine.length; i++) {
      const char = commandLine[i];

      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else if (!inQuotes && char === ' ') {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  // Variable management
  private setVariable(name: string, value: string, type: 'string' | 'number' | 'boolean' = 'string', readonly = false) {
    this.variables.set(name, { name, value, type, readonly });
  }

  // Command handlers
  private handleExport(args: string[]): string {
    if (args.length === 0) {
      return this.handleEnv();
    }

    const assignment = args.join(' ');
    const match = assignment.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);

    if (!match) {
      return 'export: invalid assignment';
    }

    const [, name, value] = match;
    this.setVariable(name, value);

    return '';
  }

  private handleUnset(args: string[]): string {
    if (args.length === 0) {
      return 'unset: missing variable name';
    }

    const varName = args[0];
    const variable = this.variables.get(varName);

    if (!variable) {
      return `unset: ${varName}: not found`;
    }

    if (variable.readonly) {
      return `unset: ${varName}: readonly variable`;
    }

    this.variables.delete(varName);
    return '';
  }

  private handleEnv(): string {
    const vars = Array.from(this.variables.values())
      .map(v => `${v.name}=${v.value}`)
      .sort()
      .join('\n');

    return vars;
  }

  private handleAlias(args: string[]): string {
    if (args.length === 0) {
      const aliases = Array.from(this.aliases.entries())
        .map(([name, command]) => `${name}='${command}'`)
        .sort()
        .join('\n');

      return aliases || 'No aliases defined';
    }

    const assignment = args.join(' ');
    const match = assignment.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);

    if (!match) {
      return 'alias: invalid assignment';
    }

    const [, name, command] = match;
    this.aliases.set(name, command.replace(/^['"]|['"]$/g, ''));

    return '';
  }

  private handleUnalias(args: string[]): string {
    if (args.length === 0) {
      return 'unalias: missing alias name';
    }

    const name = args[0];
    if (!this.aliases.has(name)) {
      return `unalias: ${name}: not found`;
    }

    this.aliases.delete(name);
    return '';
  }

  private handleHistory(): string {
    return this.history
      .map((cmd, index) => `${(index + 1).toString().padStart(4)} ${cmd}`)
      .join('\n');
  }

  private handleGrep(args: string[]): string {
    if (args.length === 0) {
      return 'grep: missing pattern';
    }

    const pattern = args[0];
    const filename = args[1];

    // Implementation would search in file or stdin
    return `grep: searching for pattern '${pattern}' ${filename ? `in ${filename}` : 'in input'}`;
  }

  private handleSort(args: string[]): string {
    const filename = args[0];
    return `sort: sorting ${filename || 'input'}`;
  }

  private handleWc(args: string[]): string {
    const filename = args[0];
    return `wc: counting lines, words, chars in ${filename || 'input'}`;
  }

  private handleHead(args: string[]): string {
    let lines = 10;
    let filename = '';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && i + 1 < args.length) {
        lines = parseInt(args[i + 1]) || 10;
        i++; // Skip next arg
      } else {
        filename = args[i];
      }
    }

    return `head: showing first ${lines} lines of ${filename || 'input'}`;
  }

  private handleTail(args: string[]): string {
    let lines = 10;
    let filename = '';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && i + 1 < args.length) {
        lines = parseInt(args[i + 1]) || 10;
        i++; // Skip next arg
      } else {
        filename = args[i];
      }
    }

    return `tail: showing last ${lines} lines of ${filename || 'input'}`;
  }

  private handleScript(args: string[]): string {
    if (args.length === 0) {
      return 'script: missing action (create|run|list|delete)';
    }

    const action = args[0];
    const name = args[1];

    switch (action) {
      case 'create':
        if (!name) return 'script: missing script name';
        // Implementation would open script editor
        return `script: creating script '${name}'`;

      case 'run':
        if (!name) return 'script: missing script name';
        // Implementation would execute script
        return `script: running script '${name}'`;

      case 'list':
        const scripts = Array.from(this.scripts.keys()).join('\n');
        return scripts || 'No scripts found';

      case 'delete':
        if (!name) return 'script: missing script name';
        if (this.scripts.has(name)) {
          this.scripts.delete(name);
          return `script: deleted '${name}'`;
        }
        return `script: '${name}' not found`;

      default:
        return 'script: invalid action (create|run|list|delete)';
    }
  }

  private handleIf(args: string[]): string {
    // Simplified conditional implementation
    return 'if: conditional execution (simplified implementation)';
  }

  private handleFor(args: string[]): string {
    // Simplified loop implementation
    return 'for: loop execution (simplified implementation)';
  }

  // Pipeline command implementations
  private pipeGrep(args: string[], input: string): string {
    if (args.length === 0) return input;

    const pattern = args[0];
    const regex = new RegExp(pattern, 'i');

    return input
      .split('\n')
      .filter(line => regex.test(line))
      .join('\n');
  }

  private pipeSort(args: string[], input: string): string {
    const lines = input.split('\n');

    if (args.includes('-r')) {
      return lines.sort().reverse().join('\n');
    }

    return lines.sort().join('\n');
  }

  private pipeWc(args: string[], input: string): string {
    const lines = input.split('\n').length;
    const words = input.split(/\s+/).filter(w => w).length;
    const chars = input.length;

    if (args.includes('-l')) return lines.toString();
    if (args.includes('-w')) return words.toString();
    if (args.includes('-c')) return chars.toString();

    return `${lines} ${words} ${chars}`;
  }

  private pipeHead(args: string[], input: string): string {
    let lines = 10;

    const nIndex = args.indexOf('-n');
    if (nIndex !== -1 && nIndex + 1 < args.length) {
      lines = parseInt(args[nIndex + 1]) || 10;
    }

    return input.split('\n').slice(0, lines).join('\n');
  }

  private pipeTail(args: string[], input: string): string {
    let lines = 10;

    const nIndex = args.indexOf('-n');
    if (nIndex !== -1 && nIndex + 1 < args.length) {
      lines = parseInt(args[nIndex + 1]) || 10;
    }

    const inputLines = input.split('\n');
    return inputLines.slice(-lines).join('\n');
  }

  // Getters for terminal state
  getVariables(): Map<string, TerminalVariable> {
    return new Map(this.variables);
  }

  getAliases(): Map<string, string> {
    return new Map(this.aliases);
  }

  getHistory(): string[] {
    return [...this.history];
  }
}

export const advancedTerminal = new AdvancedTerminalProcessor();
export default AdvancedTerminalProcessor;