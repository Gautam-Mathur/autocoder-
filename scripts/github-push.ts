// GitHub Push Script using Octokit
// Uploads all changed files and creates commits on GitHub

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
    throw new Error('X_REPLIT_TOKEN not found');
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

async function getGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    // Skip certain directories and files
    if (entry.name === '.git' || 
        entry.name === 'node_modules' || 
        entry.name === '.replit' ||
        entry.name === 'replit.nix' ||
        entry.name === '.cache' ||
        entry.name === '.config' ||
        entry.name === '.upm' ||
        entry.name === 'dist' ||
        entry.name === 'temp_repo' ||
        entry.name === 'attached_assets' ||
        entry.name === 'scripts' ||
        entry.name.startsWith('.local') ||
        entry.name.endsWith('.log')) {
      continue;
    }
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

async function pushToGitHub() {
  console.log('🚀 Connecting to GitHub...');
  
  const octokit = await getGitHubClient();
  
  // Get authenticated user
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`✓ Authenticated as: ${user.login}`);
  
  // Get repo info from git config
  const gitConfigPath = path.join(process.cwd(), '.git', 'config');
  const gitConfig = fs.readFileSync(gitConfigPath, 'utf-8');
  
  const remoteMatch = gitConfig.match(/url = .*github\.com[:/]([^/]+)\/([^.\s]+)/);
  if (!remoteMatch) {
    throw new Error('Could not find GitHub remote in git config');
  }
  
  const owner = remoteMatch[1];
  const repo = remoteMatch[2].replace('.git', '');
  console.log(`📁 Repository: ${owner}/${repo}`);
  
  const branch = 'main';
  console.log(`🌿 Branch: ${branch}`);
  
  // Get the current commit on GitHub
  let parentSha: string;
  try {
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });
    parentSha = ref.object.sha;
    console.log(`☁️  Current remote commit: ${parentSha.substring(0, 7)}`);
  } catch (error: any) {
    if (error.status === 404) {
      // Get default branch
      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const { data: ref } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${repoData.default_branch}`
      });
      parentSha = ref.object.sha;
    } else {
      throw error;
    }
  }
  
  // Get all files to upload
  console.log('📦 Gathering files...');
  const files = getAllFiles(process.cwd());
  console.log(`   Found ${files.length} files`);
  
  // Create blobs for all files
  console.log('⬆️  Uploading files...');
  const treeItems: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = [];
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  async function uploadWithRetry(filePath: string, maxRetries = 3): Promise<string | null> {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath);
    const isText = !content.includes(0x00);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: isText ? content.toString('utf-8') : content.toString('base64'),
          encoding: isText ? 'utf-8' : 'base64'
        });
        return blob.sha;
      } catch (err: any) {
        if (err.status === 403 && attempt < maxRetries) {
          const waitTime = attempt * 2000; // 2s, 4s, 6s
          console.log(`   ⏳ Rate limited on ${filePath}, waiting ${waitTime/1000}s...`);
          await delay(waitTime);
        } else if (attempt === maxRetries) {
          console.warn(`   ⚠️  Failed ${filePath} after ${maxRetries} attempts`);
          return null;
        }
      }
    }
    return null;
  }
  
  let uploaded = 0;
  let failed = 0;
  for (const filePath of files) {
    // Add delay between requests to avoid rate limiting
    await delay(100);
    
    const sha = await uploadWithRetry(filePath);
    if (sha) {
      treeItems.push({
        path: filePath,
        mode: '100644',
        type: 'blob',
        sha
      });
      uploaded++;
    } else {
      failed++;
    }
    
    if ((uploaded + failed) % 50 === 0) {
      console.log(`   Progress: ${uploaded} uploaded, ${failed} failed of ${files.length}...`);
    }
  }
  
  console.log(`   ✓ Uploaded ${uploaded} files, ${failed} failed`);
  
  // Create tree
  console.log('🌳 Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    tree: treeItems,
    base_tree: parentSha
  });
  
  // Create commit
  console.log('📝 Creating commit...');
  const commitMessage = `Full sync from AutoCoder - ${new Date().toISOString().split('T')[0]}

Complete codebase push including all files`;

  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: tree.sha,
    parents: [parentSha]
  });
  
  console.log(`   Commit: ${commit.sha.substring(0, 7)}`);
  
  // Update reference
  console.log('🔗 Updating branch reference...');
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commit.sha
  });
  
  console.log('✅ Push successful!');
  console.log(`   View at: https://github.com/${owner}/${repo}`);
}

pushToGitHub().catch(err => {
  console.error('❌ Push failed:', err.message);
  if (err.response?.data) {
    console.error('   Details:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
