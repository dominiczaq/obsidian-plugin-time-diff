# Obsidian TimeDiff Plugin

This is a plugin for Obsidian (https://obsidian.md).
## How to use

* Calculates time diffs in `timediff` markdown block
```
	```timediff
	11:10 - 12:20
	12:38 - 14:00
	23:20 - 23:59
	00:00 - 00:55
	```
```
In reading mode diffs between the dates will be parsed and presented in readable format.
Sum of diffs will be presented at the bottom of the block.

### Commands
* `TimeDiff plugin - Show total time diff count in current file` command, which calculates total sum of all `timediff` blocks on the page.
* `TimeDiff plugin - Insert timediff block` command, which inserts `timediff` block in current cursor position.
* `TimeDiff plugin - Insert current time` command, which inserts current time in current cursor position.

## Local development

- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS, then run `yarn` in the command line under your repo folder.
- Run `yarn run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
