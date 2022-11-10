import { MarkdownView, Notice, Plugin } from "obsidian";
import { moment } from "obsidian";

enum ClassNames {
	SECTION_TOTAL = "timediff-section-total",
	TEXT_ACCENT = "timediff-accent",
	SECTION_VALUE_TOTAL = "timediff-section-value-total",
}

enum Attributes {
	TOTAL_VALUE_IN_MINUTES = "data-timediff-section-total-in-minutes",
}

const timeRegex = /\d{2}:\d{2} - \d{2}:\d{2}/g;

export default class TimeDiffPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: "timediff-total",
			name: "timediff-total",
			checkCallback: (checking: boolean) => {
				if (!checking) {
					const file = this.app.workspace.getActiveFile();
					if (file) {
						const fileCache =
							this.app.metadataCache.getFileCache(file);
						const cacheRead = this.app.vault
							.cachedRead(file)
							.then((data) => {
								let totalSumInMinutes = 0;
								const codeSections =
									fileCache?.sections?.filter(
										(section) => section.type === "code"
									) || [];
								for (const section of codeSections) {
									const start = section.position.start.offset;
									const end = section.position.end.offset;
									const extracted = data.substring(
										start,
										end
									);
									if (!extracted.startsWith("```timediff")) {
										// code block without ```timediff, skip it
										continue;
									}
									const extractedWithoutCodeblocks = extracted
										.replace("```timediff", "")
										.replace("````", "");
									const rows = extractedWithoutCodeblocks
										.split("\n")
										.filter((row) => row.length > 0);
									for (const row of rows) {
										const match = row.match(timeRegex);
										if (!match) {
											continue;
										}
										const timeElements = match[0]
											.trim()
											.split(" - ");
										const [left, right] = timeElements.map(
											(timeElement) => {
												const [hours, minutes] =
													timeElement.split(":");
												return moment()
													.hours(Number(hours))
													.minutes(Number(minutes));
											}
										);
										const totalDiffInMinutes = right.diff(
											left,
											"minutes"
										);
										totalSumInMinutes += totalDiffInMinutes;
									}
								}
								const { readableDiff, diffInMinutes } =
									calculateTimeDiffs(totalSumInMinutes);
								new Notice(
									`Total: ${totalSumInMinutes}min - ${readableDiff}`
								);
							});
					}
				}
				return true;
			},
		});

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
						cls: ClassNames.TEXT_ACCENT,
					});
				}
				const div = el.createEl("div", {
					cls: ClassNames.SECTION_TOTAL,
				});
				div.createEl("span", {
					text: `Total: `,
				});
				div.createEl("span", {
					text: `${
						calculateTimeDiffs(totalSumInMinutes).readableDiff
					}`,
					cls: `${ClassNames.TEXT_ACCENT} ${ClassNames.SECTION_VALUE_TOTAL}`,
					attr: {
						"data-timediff-section-total-in-minutes": `${totalSumInMinutes}`,
					},
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
