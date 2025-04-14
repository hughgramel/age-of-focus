type CommandFunction = (args: string[]) => void;

interface Command {
  description: string;
  execute: CommandFunction;
}

const commands = new Map<string, Command>();

// Add commands here
commands.set('help', {
  description: 'Show available commands',
  execute: (args: string[]) => {
    console.log('Available commands:');
    commands.forEach((command, name) => {
      console.log(`${name}: ${command.description}`);
    });
  }
});

commands.set('clear', {
  description: 'Clear the terminal',
  execute: (args: string[]) => {
    // The actual clear functionality will be implemented in the Terminal component
  }
});

export default commands; 