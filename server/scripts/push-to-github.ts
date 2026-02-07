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
    
    for (const file of files) {
      let retries = 3;
      while (retries > 0) {
        try {
          let blob;
          if (file.content.startsWith('__BASE64__')) {
            blob = await octokit.git.createBlob({
              owner, repo,
              content: file.content.slice(10),
              encoding: 'base64'
            });
          } else {
            blob = await octokit.git.createBlob({
              owner, repo,
              content: file.content,
              encoding: 'utf-8'
            });
          }
          
          treeItems.push({
            path: file.path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blob.data.sha
          });
          
          blobCount++;
          if (blobCount % 50 === 0) {
            console.log(`  Created ${blobCount}/${files.length} blobs...`);
            await delay(2000);
          } else if (blobCount % 10 === 0) {
            await delay(500);
          }
          break;
        } catch (e: any) {
          if (e.message?.includes('secondary rate limit') && retries > 1) {
            console.log(`  Rate limited on ${file.path}, waiting 30s... (${retries - 1} retries left)`);
            await delay(30000);
            retries--;
          } else {
            console.log(`  Skipping ${file.path}: ${e.message}`);
            break;
          }
        }
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
      message: 'Update documentation: plan-driven pipeline test suite, accurate statistics, 14 industry domains',
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
