import { Plugin } from "obsidian";
import { moment } from "obsidian";

export default class TimeDiffPlugin extends Plugin {
	async onload() {
		const timeRegex = /\d{2}:\d{2} - \d{2}:\d{2}/g;

		this.registerMarkdownCodeBlockProcessor(
			"timediff",
			(source, el, _ctx) => {
				let totalSumInMinutes = 0;
				const rows = source.split("\n").filter((row) => row.length > 0);
				for (const row of rows) {
					const match = row.match(timeRegex);
					if (!match) {
						const div = el.createEl("div");
						div.createEl("span", {
							text: `${row}`,
						});
						continue;
					}
					const timeElements = match[0].trim().split(" - ");
					const [left, right] = timeElements.map((timeElement) => {
						const [hours, minutes] = timeElement.split(":");
						return moment()
							.hours(Number(hours))
							.minutes(Number(minutes));
					});
					const totalDiffInMinutes = right.diff(left, "minutes");
					totalSumInMinutes += totalDiffInMinutes;
					const { readableDiff } =
						calculateTimeDiffs(totalDiffInMinutes);
					const div = el.createEl("div");
					div.createEl("span", {
						text: `${row}`,
					});
					div.createEl("span", {
						text: `\t${readableDiff}`,
						cls: "timediff-accent",
					});
				}
				const div = el.createEl("div");
				div.createEl("span", {
					text: `Total: `,
				});
				div.createEl("span", {
					text: `${
						calculateTimeDiffs(totalSumInMinutes).readableDiff
					}`,
					cls: "timediff-accent",
				});
			}
		);
	}

	onunload() {}
}

function calculateTimeDiffs(totalDiffInMinutes: number): {
	diffInHours: number;
	diffInMinutes: number;
	readableDiff: string;
} {
	const diffInHours = Math.floor(totalDiffInMinutes / 60);
	const diffInMinutes = totalDiffInMinutes % 60;
	const readableDiff = `${diffInHours}h${diffInMinutes}min`;
	return { diffInHours, diffInMinutes, readableDiff };
}
