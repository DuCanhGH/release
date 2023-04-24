import git from "git-state";
import repoName from "git-repo-name";
import repoUser from "git-username";

import type { GithubConnection, RepoDetails } from "../types.js";

const handleSpinner = require("./spinner");

export const getRepo = (githubConnection: GithubConnection): Promise<RepoDetails> => {
    return new Promise((resolve) => {
        repoName((err, repo) => {
            if (err) {
                handleSpinner.fail("Could not determine GitHub repository.");
                return;
            }

            const details: RepoDetails = { repo, user: "" };

            try {
                const resolvedRepoUser = repoUser();
                if (!resolvedRepoUser) {
                    handleSpinner.fail("Could not determine repo user.");
                    return;
                }
                githubConnection.repos
                    .get({ owner: resolvedRepoUser, repo: details.repo })
                    .then((detailedRepo) => {
                        details.user = detailedRepo.data.owner.login;
                        resolve(details);
                    });
            } catch (err) {
                handleSpinner.fail(
                    `Could not determine GitHub repository. Error: ${JSON.stringify(
                        err,
                        null,
                        2
                    )}`
                );
                return;
            }
        });
    });
};

export const branchSynced = () =>
    new Promise((resolve) => {
        const path = process.cwd();

        const ignore = ["branch", "stashes", "untracked"] as const;

        git.isGit(path, (exists) => {
            if (!exists) {
                return;
            }

            git.check(path, (err, results) => {
                if (err) {
                    resolve(false);
                    return;
                }

                for (const state of ignore) {
                    delete results[state];
                }

                for (const result in results) {
                    if ((results[result as keyof typeof results] as any) > 0) {
                        resolve(false);
                        break;
                    }
                }

                resolve(true);
            });
        });
    });
