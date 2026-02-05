// GitHub Push Script - Uses Replit GitHub Integration
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

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Get all files to push (excluding node_modules, .git, etc)
function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  const ignoreDirs = ['node_modules', '.git', 'dist', '.cache', '.replit', '.config'];
  const ignoreFiles = ['.DS_Store', 'package-lock.json'];
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        files.push(...getAllFiles(fullPath, baseDir));
      }
    } else {
      if (!ignoreFiles.includes(entry.name)) {
        files.push(relativePath);
      }
    }
  }
  
  return files;
}

async function pushToGitHub() {
  const octokit = await getGitHubClient();
  
  const { data: user } = await octokit.users.getAuthenticated();
  console.log('Authenticated as:', user.login);
  
  const owner = 'Gautam-Mathur';
  const repo = 'autocoder-';
  const branch = 'main';
  const baseDir = process.cwd();
  
  // Get current commit SHA
  let currentSha: string = '';
  let baseTree: string | undefined;
  
  try {
    const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    currentSha = ref.object.sha;
    const { data: commit } = await octokit.git.getCommit({ owner, repo, commit_sha: currentSha });
    baseTree = commit.tree.sha;
    console.log('Current commit:', currentSha);
  } catch (e) {
    console.log('Branch not found, creating new');
  }

  // Get changed files (just push the important ones for now)
  const filesToPush = [
    'server/modules/ai-code-refiner.ts',
    'server/modules/index.ts',
    'server/modules/deep-project-generator.ts',
    'server/modules/complete-code-intelligence.ts',
    'server/routes.ts',
    'client/src/lib/code-runner/webcontainer.ts',
    'client/src/lib/code-generator/runnable-templates.ts',
    'client/src/lib/code-generator/saas-templates.ts',
    'client/src/lib/code-generator/code-brain.ts',
    'client/src/lib/code-generator/engine.ts',
    'client/src/lib/code-generator/advanced-intelligence.ts',
  ].filter(f => fs.existsSync(path.join(baseDir, f)));
  
  console.log('Pushing', filesToPush.length, 'files...');

  // Create blobs for each file
  const treeItems: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string }> = [];
  
  for (const filePath of filesToPush) {
    const content = fs.readFileSync(path.join(baseDir, filePath), 'utf-8');
    const { data: blob } = await octokit.git.createBlob({
      owner, repo,
      content: Buffer.from(content).toString('base64'),
      encoding: 'base64',
    });
    treeItems.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.sha });
    console.log('  ✓', filePath);
  }

  // Create new tree
  const { data: newTree } = await octokit.git.createTree({
    owner, repo,
    base_tree: baseTree,
    tree: treeItems,
  });

  // Create commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner, repo,
    message: 'Add comprehensive SaaS templates (Invoice, CRM, E-commerce, Project Management)',
    tree: newTree.sha,
    parents: currentSha ? [currentSha] : [],
  });

  // Update branch
  if (currentSha) {
    await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: newCommit.sha });
  } else {
    await octokit.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha: newCommit.sha });
  }
  
  console.log('\n✓ Successfully pushed to GitHub!');
  console.log(`  https://github.com/${owner}/${repo}/commit/${newCommit.sha}`);
}

pushToGitHub().catch(err => {
  console.error('Push failed:', err.message);
  process.exit(1);
});
