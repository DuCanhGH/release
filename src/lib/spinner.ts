// Packages
import ora from "ora";
import * as logger from "./logger.js";

export const create = (message: string) => {
    if (global.spinner) {
        global.spinner.succeed();
    }

    global.spinner = ora(message).start();
};

export const fail = (message: string) => {
    if (global.spinner) {
        global.spinner.fail();
        console.log("");
    }

    logger.error(message);
    process.exit(1);
};
