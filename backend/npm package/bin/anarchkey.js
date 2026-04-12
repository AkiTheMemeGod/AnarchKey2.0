#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const path = require('path');
const AnarchKeyClient = require('../lib/AnarchKeyClient');

const program = new Command();
program.name('anarchkey').description('AnarchKey CLI');

program
  .command('init')
  .description('Initialize local token by calling anarchkey_init endpoint')
  .option('--base-url <url>', 'Base URL of the AnarchKey service', 'https://anarchkey2-0.onrender.com')
  .option('--out-file <path>', 'Path to write the init token', path.join(require('os').homedir(), '.anarchkey'))
  .option('--username <username>', 'username to send to the init endpoint')
  .option('--password <password>', 'password to send to the init endpoint')
  .action(async (opts) => {
    try {
      const token = await AnarchKeyClient.doInit({
        baseUrl: opts.baseUrl,
        outFile: opts.outFile,
        username: opts.username,
        password: opts.password
      });
      console.log(`Wrote init token to ${opts.outFile}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 2;
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
