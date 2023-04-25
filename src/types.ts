import type { connect } from "./lib/connect.js";

export type GithubConnection = Awaited<ReturnType<typeof connect>>;

export interface RepoDetails {
  repo: string;
  user: string;
}

export interface Commit {
  tag: string;
  version: string;
  hash?: string;
  date: Date | null;
}

export type RequireFields<T, U extends keyof T> = T & Required<Pick<T, U>>;