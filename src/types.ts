import type { connect } from "./lib/connect.js";

export type GithubConnection = Awaited<ReturnType<typeof connect>>;

export interface RepoDetails {
  repo: string;
  user: string;
}

export interface Commit {
  tag: string;
  version: string;
  hash: string | null;
  date: Date | null;
}
