import { Octokit } from "@octokit/rest";

export function createOctokit(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken });
}

export async function getUserRepos(accessToken: string) {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 30,
    type: "all",
  });
  return data;
}

export async function getRepoPullRequests(
  accessToken: string,
  owner: string,
  repo: string
) {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 20,
  });
  return data;
}

export async function getPullRequestFiles(
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });
  return data;
}

export async function getPullRequestDiff(
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
    mediaType: { format: "diff" },
  });
  return data as unknown as string;
}

export async function getRepoFile(
  accessToken: string,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  const octokit = createOctokit(accessToken);
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if ("content" in data && typeof data.content === "string") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
  } catch {
    return null;
  }
  return null;
}

export async function getRepoTree(
  accessToken: string,
  owner: string,
  repo: string
) {
  const octokit = createOctokit(accessToken);
  const repoData = await octokit.repos.get({ owner, repo });
  const branch = repoData.data.default_branch;
  const ref = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const treeSha = ref.data.object.sha;
  const { data } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: "true",
  });
  return data.tree;
}
