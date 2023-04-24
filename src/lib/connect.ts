// Native

// Packages
const open = require("opn");
const retry = require("async-retry");
const sleep = require("delay");

import { Octokit } from "@octokit/rest";
import { fetch } from "undici";
import querystring from "node:querystring";

import { generateString } from "./generate-string.js";
// Utilities
const pkg = require("../package");
const handleSpinner = require("./spinner");

const config: Record<string, string> = {};

const github = new Octokit({
    headers: {
        "user-agent": `Release v${pkg.version}`,
    },
});

const tokenAPI = (state) =>
    retry(
        () =>
            new Promise(async (resolve, reject) => {
                const qs = querystring.stringify({ state });
                try {
                    const res = await fetch(
                        `https://release-auth.vercel.sh/?${qs}`
                    );
                    if (res.status === 403) {
                        reject(new Error("Unauthorized"));
                    }
                    const data = (await res.json()) as {
                        error?: any;
                        token?: any;
                    };
                    if (data.error) {
                        reject(data.error);
                    }
                    resolve(data.token);
                } catch (error) {
                    reject(error);
                }
            }),
        {
            retries: 500,
        }
    );

const validateToken = (token: string) =>
    new Promise((resolve) => {
        github.auth({
            type: "token",
            token,
        });
        github.users.getByUsername({
            username: "DuCanhGH",
        });
    });

const loadToken = async () => {
    if (config.token) {
        const fromStore = config.token;
        const valid = await validateToken(fromStore);

        return valid ? fromStore : false;
    }

    return false;
};

const requestToken = async (showURL: string) => {
    let authURL = "https://github.com/login/oauth/authorize";

    const state = generateString(20);

    authURL += `?${querystring.stringify({
        client_id: "08bd4d4e3725ce1c0465",
        scope: "repo",
        state,
    })}`;

    try {
        if (showURL) {
            throw new Error("No browser support");
        }

        open(authURL, { wait: false });
    } catch (err) {
        global.spinner.stop();
        console.log(`Please click this link to authenticate: ${authURL}`);
    }

    const token = await tokenAPI(state);
    config.token = token;

    return token;
};

export const connect = async (showURL: string) => {
    let token = await loadToken();

    if (!token) {
        handleSpinner.create(
            showURL
                ? "Retrieving authentication link"
                : "Opening GitHub authentication page"
        );
        await sleep(100);

        try {
            token = await requestToken(showURL);
        } catch (err) {
            handleSpinner.fail("Could not load token.");
        }
    }

    github.auth({
        type: "token",
        token,
    });

    return github;
};
