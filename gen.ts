import * as dotenv from "dotenv";
import cp from "child_process";
import fetch from "node-fetch";

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
    throw new Error(`Failed to get latest commit: ${res.status}`);
  }
};

const pkgsEntriesToDhall = (entries: PkgEntry[]): string => {
  return `
let upstream = https://github.com/purescript/package-sets/releases/download/psc-0.15.8-20230430/packages.dhall

in upstream

${entries.map(pkgsEntryToDhall).join("\n")}
`;
};

const pkgsEntryToDhall = (entry: PkgEntry): string => {
  const { repo, version, dependencies } = entry;
  const deps = dependencies.join(", ");

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
    throw new Error(`Failed to get latest commit: ${res.status}`);
  }
};

const repoToString = (repo: Repo): string => {
  const { user, repoName } = repo;
  if (repo.private) {
    return `ssh://git@github/${user}/${repoName}.git`;
  } else {
    return `https://github.com/${user}/${repoName}.git`;
  }
};

const getPackagesDhall = async (repos: Repo[]): Promise<string> => {
  const entries: PkgEntry[] = [];
  for (const repo of repos) {
    console.error(`Fetching ${repo.user}/${repo.repoName}`);
    const repoPurs = { ...repo, repoName: `purescript-${repo.repoName}` };
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
  }

  return pkgsEntriesToDhall(entries);
};

const main = async () => {
  const repos: Repo[] = [
    { user: "thought2", repoName: "virtual-dom", rev: "main" },
    { user: "thought2", repoName: "virtual-dom-react-basic", rev: "main" },
    { user: "thought2", repoName: "data-mvc", rev: "main" },
    { user: "thought2", repoName: "virtual-dom-halogen", rev: "main" },
    { user: "thought2", repoName: "marked", rev: "main", private: true },
    { user: "thought2", repoName: "variant-encodings", rev: "main" },
    { user: "thought2", repoName: "ts-bridge", rev: "main" },
    { user: "thought2", repoName: "markdown-to-virtual-dom", rev: "main", private: true },
  
  ];

  const pkgsDhall = await getPackagesDhall(repos);

  console.log(pkgsDhall);
};

main();
