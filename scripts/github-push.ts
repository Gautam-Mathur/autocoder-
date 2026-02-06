import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

// GitHub connector integration (Replit)
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
    throw new Error('Replit token not found');
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

const OWNER = 'Gautam-Mathur';
const REPO = 'autocoder-';
const BRANCH = 'main';

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.name === '.git' || 
        entry.name === 'node_modules' ||
        entry.name === '.cache' ||
        entry.name === '.config' ||
        entry.name === '.upm' ||
        entry.name === '.replit' ||
        entry.name === 'replit.nix' ||
        entry.name === 'replit.md' ||
        entry.name === '.local') {
      continue;
    }

    if (entry.isSymbolicLink()) {
      continue;
    }
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  
  return files;
}

async function pushToGitHub() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);
  console.log(`Repository: ${OWNER}/${REPO}`);
  console.log(`Branch: ${BRANCH}`);

  let parentSha: string;
  try {
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`
    });
    parentSha = ref.object.sha;
    console.log(`Current remote commit: ${parentSha.substring(0, 7)}`);
  } catch (error: any) {
    if (error.status === 404) {
      const { data: repoData } = await octokit.repos.get({ owner: OWNER, repo: REPO });
      const { data: ref } = await octokit.git.getRef({
        owner: OWNER,
        repo: REPO,
        ref: `heads/${repoData.default_branch}`
      });
      parentSha = ref.object.sha;
    } else {
      throw error;
    }
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  console.log('Fetching remote tree...');
  const { data: parentCommit } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: parentSha
  });
  
  async function getRemoteTree(treeSha: string): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const { data: tree } = await octokit.git.getTree({
      owner: OWNER,
      repo: REPO,
      tree_sha: treeSha,
      recursive: 'true'
    });
    for (const item of tree.tree) {
      if (item.type === 'blob' && item.path && item.sha) {
        map.set(item.path, item.sha);
      }
    }
    return map;
  }
  
  const remoteFiles = await getRemoteTree(parentCommit.tree.sha);
  console.log(`Remote tree has ${remoteFiles.size} files`);

  console.log('Gathering local files...');
  const localFiles = getAllFiles(process.cwd());
  console.log(`Found ${localFiles.length} local files`);

  const crypto = await import('crypto');
  function computeGitBlobSha(content: Buffer): string {
    const header = `blob ${content.length}\0`;
    const store = Buffer.concat([Buffer.from(header), content]);
    return crypto.createHash('sha1').update(store).digest('hex');
  }

  const changedFiles: string[] = [];
  const unchangedShas = new Map<string, string>();
  for (const filePath of localFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath);
    const localSha = computeGitBlobSha(content);
    const remoteSha = remoteFiles.get(filePath);
    if (remoteSha === localSha) {
      unchangedShas.set(filePath, remoteSha);
    } else {
      changedFiles.push(filePath);
    }
  }
  
  const deletedFiles = [...remoteFiles.keys()].filter(f => !localFiles.includes(f));
  console.log(`Changed: ${changedFiles.length}, Unchanged: ${unchangedShas.size}, Deleted from remote: ${deletedFiles.length}`);

  if (changedFiles.length === 0 && deletedFiles.length === 0) {
    console.log('No changes to push!');
    return;
  }

  console.log('Uploading changed files...');
  const treeItems: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = [];

  for (const [fp, sha] of unchangedShas) {
    treeItems.push({ path: fp, mode: '100644', type: 'blob', sha });
  }

  async function uploadWithRetry(filePath: string, maxRetries = 5): Promise<string | null> {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath);
    const isText = !content.includes(0x00);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data: blob } = await octokit.git.createBlob({
          owner: OWNER,
          repo: REPO,
          content: isText ? content.toString('utf-8') : content.toString('base64'),
          encoding: isText ? 'utf-8' : 'base64'
        });
        return blob.sha;
      } catch (err: any) {
        if ((err.status === 403 || err.status === 429 || err.status === 502 || err.status === 503) && attempt < maxRetries) {
          const waitTime = attempt * 3000;
          console.log(`   Retry ${attempt}/${maxRetries} for ${filePath} (${err.status}), waiting ${waitTime/1000}s...`);
          await delay(waitTime);
        } else if (attempt === maxRetries) {
          console.warn(`   Failed ${filePath} after ${maxRetries} attempts (${err.status})`);
          return null;
        }
      }
    }
    return null;
  }

  let uploaded = 0;
  let failed = 0;
  for (const filePath of changedFiles) {
    const sha = await uploadWithRetry(filePath);
    if (sha) {
      treeItems.push({ path: filePath, mode: '100644', type: 'blob', sha });
      uploaded++;
    } else {
      failed++;
    }
    if (uploaded % 20 === 0) {
      console.log(`   Progress: ${uploaded}/${changedFiles.length} changed files uploaded...`);
    }
    await delay(100);
  }
  
  console.log(`Uploaded ${uploaded} changed files, ${failed} failed`);

  console.log('Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree: treeItems,
  });

  console.log('Creating commit...');
  const commitMessage = `Update AutoCoder - ${new Date().toISOString().split('T')[0]}\n\nFull codebase sync with all fixes applied`;

  const { data: commit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: commitMessage,
    tree: tree.sha,
    parents: [parentSha]
  });
  
  console.log(`Commit: ${commit.sha.substring(0, 7)}`);

  console.log('Updating branch...');
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: commit.sha,
    force: true
  });
  
  console.log(`\nPush successful! ${uploaded} files pushed.`);
  console.log(`View at: https://github.com/${OWNER}/${REPO}`);
}

pushToGitHub().catch(err => {
  console.error('Push failed:', err.message);
  if (err.response?.data) {
    console.error('Details:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
