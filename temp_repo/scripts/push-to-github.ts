import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";

// GitHub Integration via Replit Connectors
let connectionSettings: any;

async function getAccessToken(): Promise<string> {
  if (
    connectionSettings &&
    connectionSettings.settings.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }

  connectionSettings = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=github",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("GitHub not connected");
  }
  return accessToken;
}

async function getUncachableGitHubClient(): Promise<Octokit> {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

interface PushOptions {
  owner: string;
  repo: string;
  branch?: string;
  commitMessage?: string;
  files?: string[];
  excludePatterns?: string[];
}

const DEFAULT_EXCLUDE = [
  "node_modules",
  ".git",
  ".cache",
  "dist",
  ".replit",
  "replit.nix",
  ".upm",
  "package-lock.json",
  ".config",
  "attached_assets",
];

function shouldExclude(filePath: string, excludePatterns: string[]): boolean {
  return excludePatterns.some(
    (pattern) => filePath.includes(pattern) || filePath.startsWith(pattern)
  );
}

function getAllFiles(
  dirPath: string,
  arrayOfFiles: string[] = [],
  basePath: string = dirPath,
  excludePatterns: string[] = DEFAULT_EXCLUDE
): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(basePath, fullPath);

    if (shouldExclude(relativePath, excludePatterns)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles, basePath, excludePatterns);
    } else {
      arrayOfFiles.push(relativePath);
    }
  });

  return arrayOfFiles;
}

function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, { encoding: "base64" });
}

async function pushToGitHub(options: PushOptions): Promise<void> {
  const octokit = await getUncachableGitHubClient();

  const {
    owner,
    repo,
    branch = "main",
    commitMessage = "Update from CodeAI",
  } = options;

  console.log(`Pushing to ${owner}/${repo} on branch ${branch}...`);

  try {
    let baseSha: string;
    try {
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      });
      baseSha = refData.object.sha;
      console.log(`Found existing branch: ${branch}`);
    } catch (error: any) {
      if (error.status === 404) {
        const { data: defaultBranch } = await octokit.repos.get({
          owner,
          repo,
        });
        const { data: refData } = await octokit.git.getRef({
          owner,
          repo,
          ref: `heads/${defaultBranch.default_branch}`,
        });
        baseSha = refData.object.sha;

        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branch}`,
          sha: baseSha,
        });
        console.log(`Created new branch: ${branch}`);
      } else {
        throw error;
      }
    }

    const { data: baseCommit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: baseSha,
    });

    const projectRoot = process.cwd();
    const filesToUpload =
      options.files ||
      getAllFiles(
        projectRoot,
        [],
        projectRoot,
        options.excludePatterns || DEFAULT_EXCLUDE
      );

    console.log(`Preparing ${filesToUpload.length} files...`);

    const treeItems = await Promise.all(
      filesToUpload.map(async (filePath) => {
        const fullPath = path.join(projectRoot, filePath);
        const content = readFileContent(fullPath);

        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content,
          encoding: "base64",
        });

        return {
          path: filePath,
          mode: "100644" as const,
          type: "blob" as const,
          sha: blob.sha,
        };
      })
    );

    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseCommit.tree.sha,
      tree: treeItems,
    });

    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [baseSha],
    });

    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    console.log(`Successfully pushed ${filesToUpload.length} files!`);
    console.log(`Commit SHA: ${newCommit.sha}`);
    console.log(`View at: https://github.com/${owner}/${repo}/tree/${branch}`);
  } catch (error: any) {
    console.error("Error pushing to GitHub:", error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "Usage: npx tsx scripts/push-to-github.ts <owner> <repo> [branch] [message]"
    );
    console.log("");
    console.log("Examples:");
    console.log("  npx tsx scripts/push-to-github.ts myuser myrepo");
    console.log("  npx tsx scripts/push-to-github.ts myuser myrepo feature-branch");
    console.log(
      '  npx tsx scripts/push-to-github.ts myuser myrepo main "Add new feature"'
    );
    console.log("");
    console.log("The script uses the connected GitHub account for authentication.");
    process.exit(1);
  }

  const [owner, repo, branch, ...messageParts] = args;
  const commitMessage =
    messageParts.length > 0 ? messageParts.join(" ") : undefined;

  await pushToGitHub({
    owner,
    repo,
    branch: branch || "main",
    commitMessage,
  });
}

main().catch((error) => {
  console.error("Failed:", error.message);
  process.exit(1);
});

export { pushToGitHub, PushOptions };
