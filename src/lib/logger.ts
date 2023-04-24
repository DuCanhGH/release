import chalk from "chalk";

export const prefixes = {
    wait: chalk.cyan("wait") + "  -",
    error: chalk.red("error") + " -",
    warn: chalk.yellow("warn") + "  -",
    info: chalk.cyan("info") + "  -",
} as const;

export const wait = (...message: any[]) => {
    console.log(prefixes.wait, ...message);
};

export const error = (...message: any[]) => {
    console.error(prefixes.error, ...message);
};

export const warn = (...message: any[]) => {
    console.warn(prefixes.warn, ...message);
};

export const info = (...message: any[]) => {
    console.log(prefixes.info, ...message);
};
