export const pluralize = (word: string, count: number): string =>
  `${count} ${word}${count === 1 ? "" : "s"}`;
