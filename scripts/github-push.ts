import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

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
        entry.name === '.replit' ||
        entry.name === 'replit.nix' ||
        entry.name === 'replit.md' ||
        entry.name === '.cache' ||
        entry.name === '.config' ||
        entry.name === '.upm' ||
        entry.name === 'dist' ||
        entry.name === 'temp_repo' ||
        entry.name === 'attached_assets' ||
        entry.name.startsWith('.local') ||
        entry.name.startsWith('.breakpoints') ||
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
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN not set');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

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

  console.log('Gathering files...');
  const files = getAllFiles(process.cwd());
  console.log(`Found ${files.length} files`);

  console.log('Uploading files...');
  const treeItems: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = [];
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  async function uploadWithRetry(filePath: string, maxRetries = 3): Promise<string | null> {
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
        if (err.status === 403 && attempt < maxRetries) {
          const waitTime = attempt * 2000;
          console.log(`   Rate limited on ${filePath}, waiting ${waitTime/1000}s...`);
          await delay(waitTime);
        } else if (attempt === maxRetries) {
          console.warn(`   Failed ${filePath} after ${maxRetries} attempts`);
          return null;
        }
      }
    }
    return null;
  }
  
  let uploaded = 0;
  let failed = 0;
  for (const filePath of files) {
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
  
  console.log(`Uploaded ${uploaded} files, ${failed} failed`);

  console.log('Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree: treeItems,
    base_tree: parentSha
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
