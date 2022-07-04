import { Plugin } from "obsidian";
import { differenceInMinutes } from "date-fns";

export default class TimeDiffPlugin extends Plugin {
	async onload() {
		const timeRegex = /\d{2}:\d{2} - \d{2}:\d{2}/g;

		this.registerMarkdownCodeBlockProcessor(
			"timediff",
			(source, el, ctx) => {
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
						return new Date().setHours(
							Number(hours),
							Number(minutes)
						);
					});
					const totalDiffInMinutes = differenceInMinutes(right, left);
					totalSumInMinutes += totalDiffInMinutes;
					const { readableDiff } =
						calculateTimeDiffs(totalDiffInMinutes);
					const div = el.createEl("div");
					div.createEl("span", {
						text: `${row}`,
					});
					const diffSpan = div.createEl("span", {
						text: `\t${readableDiff}`,
					});
					diffSpan.style.color = "var(--interactive-accent)";
				}
				const div = el.createEl("div");
				div.createEl("span", {
					text: `Total: `,
				});
				const diffSpan = div.createEl("span", {
					text: `${
						calculateTimeDiffs(totalSumInMinutes).readableDiff
					}`,
				});
				diffSpan.style.color = "var(--interactive-accent)";
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
