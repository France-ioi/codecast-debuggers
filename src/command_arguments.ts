import { parse } from 'ts-command-line-args';

export interface CommandLineOptions {
    sourcePath: string,
    inputPath: string,
    breakpoints: string,
    help: boolean,
}

export const commandOptions = parse<CommandLineOptions>({
  sourcePath: {
    description: 'The source file of the program to debug',
    alias: 's',
    type: String,
    defaultOption: true,
  },
  inputPath: {
    description: 'The input file (STDIN of the program)',
    alias: 'i',
    type: String,
    defaultValue: '',
  },
  breakpoints: {
    description: 'The lines at which to put breakpoints separated by a comma (eg. 1,2,6,42), or * for all',
    alias: 'b',
    type: String,
    defaultValue: '*',
  },
  help: {
    description: 'How to use',
    type: Boolean,
  },
});
