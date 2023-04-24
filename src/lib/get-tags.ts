// Packages
import semver from "semver";
import * as taggedVersions from "./tagged-versions.js";

const defaultRev = "HEAD --first-parent `git rev-parse --abbrev-ref HEAD`";

interface GetTagsOptions {
    rev?: string;
    previousTag?: string;
}

const defaultOptions: Required<GetTagsOptions> = {
    rev: defaultRev,
    previousTag: "",
};

export const getTags = async (options: GetTagsOptions = {}) => {
    const { rev, previousTag } = { ...defaultOptions, ...options };

    const [tags, latest] = await Promise.all([
        taggedVersions.getList({ rev }),
        taggedVersions.getLastVersion({ rev }),
    ]);

    if (!latest) {
        return [];
    }

    const isPreviousTag =
        previousTag && previousTag.length > 0
            ? (commitVersion: string) => commitVersion === previousTag
            : semver.lt;

    for (const commit of tags) {
        if (isPreviousTag(commit.version, latest.version)) {
            return [latest, commit];
        }
    }

    return [latest];
};
