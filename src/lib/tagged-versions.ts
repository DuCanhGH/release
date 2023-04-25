import semver from "semver";
import childProcess from "node:child_process";
import util from "node:util";

import type { Commit } from "../types.js";

const exec = util.promisify(childProcess.exec);

const tagRegex = /tag:\s*([^,)]+)/g;
const commitDetailsRegex = /^(.+);(.+);(.+)$/;

/**
 * Run shell command and resolve with stdout content
 */
const runCommand = (command: string) =>
    exec(command).then((result) => result.stdout);

/**
 * Get all tags with a semantic version name out of a list of Refs
 *
 * @param refs List of refs
 * @returns
 */
const getSemanticCommits = (refs: string): Commit[] => {
    const tagNames = [];
    let match: RegExpExecArray | null = [] as unknown as RegExpExecArray;

    // Finding successive matches
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches
    while (match) {
        match = tagRegex.exec(refs);

        if (match) {
            tagNames.push(match[1]);
        }
    }

    return tagNames
        .map((name) => ({
            tag: name,
            version: semver.valid(name) ?? "__null__",
            hash: undefined,
            date: null,
        }))
        .filter((tag) => tag.version != "__null__");
};

/**
 * Parse commit into an array of tag object.
 *
 * @param line Line to parse
 * @returns
 */
const parseLine = (line: string): Commit[] => {
    const match = commitDetailsRegex.exec(line);

    if (!match || match.length < 4) {
        return [];
    }

    const tags = getSemanticCommits(match[1]);
    const hash = match[2].trim();
    const date = new Date(match[3].trim());

    return tags.map((tag) => Object.assign(tag, { hash, date }));
};

/**
 * Filter tags with range.
 *
 * Skip filtering if the range is not set.
 *
 * @param tags List of tags
 * @param range Semantic range to filter with.
 * @returns
 */
const filterByRange = (tags: Commit[], range?: string) => {
    if (!range) {
        return tags;
    }

    return tags.filter((tag) => semver.satisfies(tag.version, range));
};

/**
 * Compare tag by version.
 *
 * @param a First tag
 * @param b Second tag
 * @returns
 */
const compareCommit = (a: Commit, b: Commit) =>
    semver.rcompare(a.version, b.version);

interface Options {
    /**
     * Semantic range to filter tag with
     */
    range?: string;
    /**
     * Revision range to filter tag with
     */
    rev: string;
}

/**
 * Get list of tag with a  semantic version name.
 *
 * @param options Options map or range string
 * @returns
 */
export const getList = async (options: Options | string) => {
    const range =
        typeof options === "string" ? options : options && options.range;
    const rev = typeof options !== "string" && options && options.rev;
    const fmt = '--pretty="%d;%H;%ci" --decorate=short';
    const cmd = rev
        ? `git log --simplify-by-decoration ${fmt} ${rev ?? ""}`
        : `git log --no-walk --tags ${fmt}`;

    return runCommand(cmd).then((output) => {
        const lines = output.split("\n");
        const tags = lines.map(parseLine).flat();

        return filterByRange(tags, range).sort(compareCommit);
    });
};

export const getLastVersion = (options: Options) =>
    getList(options).then((list) => list[0]);
