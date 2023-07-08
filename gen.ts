import * as dotenv from "dotenv";
import cp from "child_process";
import fetch from "node-fetch";
import fs from "fs";

dotenv.config();

type Repo = {
  user: string;
  repoName: string;
  rev: string;
  private?: boolean;
};

type PkgEntry = {
  repo: string;
  version: string;
  dependencies: string[];
  name: string;
};

type SpagoFile = {
  dependencies: string[];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getLatestCommit = async (repo: Repo): Promise<string> => {
  const url = `https://api.github.com/repos/${repo.user}/${repo.repoName}/commits/${repo.rev}`;
  const res = await fetch(url, {
    headers: repo.private
      ? { authorization: `token ${process.env.GITHUB_TOKEN}` }
      : {},
  });
  if (res.status === 200) {
    const json = await res.json();
    return (json as { sha: string }).sha;
  } else {
    throw new Error(
      `Failed to get latest commit: ${url},  ${res.status}, ${res.statusText}`
    );
  }
};

const pkgsEntriesToDhall = (entries: PkgEntry[]): string => {
  return `
let upstream =
  https://github.com/purescript/package-sets/releases/download/psc-0.15.8-20230517/packages.dhall
    sha256:8b94a0cd7f86589a6bd06d48cb9a61d69b66a94b668657b2f10c8b14c16e028c

in upstream

${entries.map(pkgsEntryToDhall).join("\n")}
`;
};

const pkgsEntryToDhall = (entry: PkgEntry): string => {
  const { repo, version, dependencies } = entry;
  const deps = dependencies.map((dep) => `"${dep}"`).join(", ");

  return `
with ${entry.name} =
  { repo = "${repo}"
  , version = "${version}"
  , dependencies = [ ${deps} ]
  }
`;
};

type CommandArgs = {
  command: string;
  args: string[];
  stdin?: string;
};

const runCommand = async (args: CommandArgs) => {
  const child = cp.spawn(args.command, args.args, { stdio: "pipe" });
  let stderr = "";
  let stdout = "";

  child.stderr.on("data", (data) => {
    stderr += data;
  });

  child.stdout.on("data", (data) => {
    stdout += data;
  });

  if (args.stdin) {
    child.stdin.write(args.stdin);
    child.stdin.end();
  }

  const exitCode = await new Promise((resolve, reject) => {
    child.on("exit", resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`Subprocess error exit ${exitCode}, ${stderr}`);
  }

  return stdout;
};

const dhallToJson = async (dhall: string): Promise<unknown> => {
  const res = await runCommand({
    command: "dhall-to-json",
    args: [],
    stdin: dhall.replace(/\.\/packages\.dhall/, "{ = }"),
  });
  return JSON.parse(res);
};

const getGithubRawUserContent = async (
  repo: Repo,
  path: string
): Promise<string> => {
  const url = `https://raw.githubusercontent.com/${repo.user}/${repo.repoName}/${repo.rev}/${path}`;
  const res = await fetch(url, {
    headers: repo.private
      ? { authorization: `token ${process.env.GITHUB_TOKEN}` }
      : {},
  });

  if (res.status === 200) {
    const text = await res.text();
    return text;
  } else {
    throw new Error(
      `Failed to get latest commit: ${res.status}, ${res.statusText}`
    );
  }
};

const repoToString = (repo: Repo): string => {
  const { user, repoName } = repo;
  if (repo.private) {
    return `ssh://git@github.com/${user}/${repoName}.git`;
  } else {
    return `https://github.com/${user}/${repoName}.git`;
  }
};

const getPackagesDhall = async (repos: Repo[]): Promise<string> => {
  const entries: PkgEntry[] = [];
  for (const repo of repos) {
    console.error(`Fetching ${repo.user}/${repo.repoName}`);
    const repoPurs = { ...repo, repoName: `${repo.repoName}` };
    console.error(`Done`);

    console.error(`Get latest commit`);
    const latestCommit = await getLatestCommit(repoPurs);
    console.error(latestCommit);

    const repo_ = { ...repoPurs, rev: latestCommit };

    console.error(`Get spago.dhall`);
    const spagoDhall = await getGithubRawUserContent(repo_, "spago.dhall");
    console.error(`Done`);

    console.error(`Convert spago.dhall to json`);
    const spagoJson = (await dhallToJson(spagoDhall)) as SpagoFile;
    console.error(`Done`);

    const pkgEntry: PkgEntry = {
      repo: repoToString(repo_),
      version: latestCommit,
      dependencies: spagoJson.dependencies,
      name: repo.repoName,
    };

    entries.push(pkgEntry);

    await delay(500);
  }

  return pkgsEntriesToDhall(entries);
};

// node, check if file exists
const fileExists = (filePath: string) => {
  try {
    fs.statSync(filePath);
    return true;
  } catch (err) {
    return false;
  }
};

const writeToLocalRepos = async (
  dir: string,
  pkgDhall: string,
  repos: Repo[]
) => {
  for (const repo of repos) {
    const filePath = `${dir}/${repo.repoName}/packages.dhall`;
    if (fileExists(filePath)) {
      console.error(`Updating ${filePath}`);
      fs.writeFileSync(filePath, pkgDhall);
      console.error(`Done`);
    } else {
      console.error(`File ${filePath} does not exist, skipping`);
    }
  }
};

const main = async () => {
  const repos = JSON.parse(fs.readFileSync("./repos.json", "utf8").toString());

  const pkgsDhall = await getPackagesDhall(repos);
  
  writeToLocalRepos("..", pkgsDhall, repos);

};

main();
