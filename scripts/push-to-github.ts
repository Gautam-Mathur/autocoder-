import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

const OWNER = 'Gautam-Mathur';
const REPO = 'autocoder-';
const BRANCH = 'main';

const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.replit',
  '.cache',
  '.upm',
  'replit.nix',
  '.config',
  'attached_assets',
  'test-output.css',
];

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (shouldIgnore(fullPath)) return;
    
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function pushToGitHub() {
  console.log('Getting GitHub client...');
  const octokit = await getUncachableGitHubClient();
  
  console.log('Getting current user...');
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  console.log(`Getting latest commit from ${OWNER}/${REPO}...`);
  let latestCommitSha: string;
  let baseTreeSha: string;

  try {
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
    });
    latestCommitSha = ref.object.sha;

    const { data: commit } = await octokit.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: latestCommitSha,
    });
    baseTreeSha = commit.tree.sha;
  } catch (error: any) {
    if (error.status === 404) {
      console.log('Branch not found, will create new branch');
      latestCommitSha = '';
      baseTreeSha = '';
    } else {
      throw error;
    }
  }

  console.log('Collecting files...');
  const files = getAllFiles('.');
  console.log(`Found ${files.length} files to upload`);

  console.log('Creating blobs...');
  const treeItems: any[] = [];

  for (const filePath of files) {
    const relativePath = filePath.startsWith('./') ? filePath.slice(2) : filePath;
    const content = fs.readFileSync(filePath);
    const isText = !content.includes(0);
    
    try {
      const { data: blob } = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: isText ? content.toString('utf-8') : content.toString('base64'),
        encoding: isText ? 'utf-8' : 'base64',
      });

      treeItems.push({
        path: relativePath,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      });
      
      console.log(`  Uploaded: ${relativePath}`);
    } catch (error: any) {
      console.error(`  Failed: ${relativePath} - ${error.message}`);
    }
  }

  console.log('Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree: treeItems,
    base_tree: baseTreeSha || undefined,
  });

  console.log('Creating commit...');
  const commitMessage = 'Add Windows-compatible Tailwind CSS setup with zero-config deployment';
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: commitMessage,
    tree: tree.sha,
    parents: latestCommitSha ? [latestCommitSha] : [],
  });

  console.log('Updating branch reference...');
  try {
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: newCommit.sha,
    });
  } catch (error: any) {
    if (error.status === 422) {
      await octokit.git.createRef({
        owner: OWNER,
        repo: REPO,
        ref: `refs/heads/${BRANCH}`,
        sha: newCommit.sha,
      });
    } else {
      throw error;
    }
  }

  console.log(`\nSuccessfully pushed to https://github.com/${OWNER}/${REPO}`);
  console.log(`Commit: ${newCommit.sha}`);
}

pushToGitHub().catch(console.error);
