// GitHub integration for pushing commits using Octokit API
// Uses GitHub's Git Data API to push files directly (no local git commands needed)
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

const IGNORE_PATTERNS = [
  'node_modules', '.git', 'dist', '.cache', '.replit',
  'temp_repo', 'generated-projects', '.config', '.upm',
  'attached_assets', '.local', 'replit.nix', '.replit'
];

function shouldIgnore(filePath: string): boolean {
  const parts = filePath.split('/');
  return parts.some(part => IGNORE_PATTERNS.includes(part));
}

function getAllFiles(dir: string, base: string = ''): { path: string; content: string }[] {
  const results: { path: string; content: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = base ? `${base}/${entry.name}` : entry.name;
    
    if (shouldIgnore(relativePath)) continue;
    
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      try {
        const isBinary = isBinaryFile(fullPath);
        if (!isBinary) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          results.push({ path: relativePath, content });
        } else {
          const content = fs.readFileSync(fullPath).toString('base64');
          results.push({ path: relativePath, content: `__BASE64__${content}` });
        }
      } catch (e) {}
    }
  }
  return results;
}

function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.svg', '.mp3', '.mp4', '.zip', '.tar', '.gz'];
  return binaryExts.includes(ext);
}

async function pushToGitHub() {
  const owner = 'Gautam-Mathur';
  const repo = 'autocoder-';
  const branch = 'main';
  
  try {
    console.log('Getting GitHub client...');
    const octokit = await getUncachableGitHubClient();
    
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);
    
    console.log('Collecting files...');
    const files = getAllFiles('/home/runner/workspace');
    console.log(`Found ${files.length} files to push`);
    
    let latestSha: string;
    try {
      const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
      latestSha = ref.object.sha;
      console.log(`Current branch SHA: ${latestSha}`);
    } catch (e) {
      console.error('Could not get branch ref. Make sure the repo exists.');
      process.exit(1);
    }
    
    const { data: baseCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestSha });
    
    console.log('Creating blobs...');
    const treeItems: any[] = [];
    let blobCount = 0;
    
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    const BATCH_SIZE = 10;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(async (file) => {
        const isBase64 = file.content.startsWith('__BASE64__');
        const blob = await octokit.git.createBlob({
          owner, repo,
          content: isBase64 ? file.content.slice(10) : file.content,
          encoding: isBase64 ? 'base64' : 'utf-8'
        });
        return { path: file.path, sha: blob.data.sha };
      }));
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          treeItems.push({
            path: result.value.path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: result.value.sha
          });
          blobCount++;
        } else {
          console.log(`  Skipping file: ${result.reason?.message || 'unknown error'}`);
        }
      }
      
      if (blobCount % 50 < BATCH_SIZE) {
        console.log(`  Created ${blobCount}/${files.length} blobs...`);
      }
      
      if (results.some(r => r.status === 'rejected' && (r.reason as any)?.message?.includes('rate limit'))) {
        console.log('  Rate limited, waiting 30s...');
        await delay(30000);
      }
    }
    
    console.log(`Created ${blobCount} blobs. Building tree...`);
    
    const { data: newTree } = await octokit.git.createTree({
      owner, repo,
      tree: treeItems,
      base_tree: undefined
    });
    
    console.log('Creating commit...');
    const { data: newCommit } = await octokit.git.createCommit({
      owner, repo,
      message: 'AutoCoder: Improve install stability (batch retry, non-accumulative batching, crash detection, visibility handling) and marker-based file protection',
      tree: newTree.sha,
      parents: [latestSha]
    });
    
    console.log('Updating branch reference...');
    await octokit.git.updateRef({
      owner, repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
      force: true
    });
    
    console.log(`Successfully pushed to GitHub! Commit: ${newCommit.sha}`);
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    process.exit(1);
  }
}

pushToGitHub();
