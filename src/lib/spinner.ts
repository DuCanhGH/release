// Packages
import type { Ora } from "ora";
import ora from "ora";
import * as logger from "./logger.js";

export let spinner: Ora;

export const create = (message: string) => {
    if (spinner) {
        spinner.succeed();
    }

    spinner = ora(message).start();
};

export const fail = (message: string) => {
    if (spinner) {
        spinner.fail();
        console.log("");
    }

    logger.error(message);
    process.exit(1);
};
