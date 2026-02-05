import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings?.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  return connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
}

function getFilesFromDir(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(process.cwd(), fullPath);
    
    if (entry.isDirectory()) {
      files.push(...getFilesFromDir(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

async function pushRemainingFiles() {
  const octokit = new Octokit({ auth: await getAccessToken() });
  const owner = 'Gautam-Mathur';
  const repo = 'autocoder-';
  const branch = 'main';

  // Get files from previously excluded directories
  const dirs = ['scripts', 'attached_assets', 'temp_repo'];
  let allFiles: string[] = [];
  
  for (const dir of dirs) {
    const files = getFilesFromDir(path.join(process.cwd(), dir));
    allFiles.push(...files);
  }
  
  console.log(`🚀 Pushing ${allFiles.length} remaining files...`);
  console.log(`   Directories: ${dirs.join(', ')}`);

  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const parentSha = ref.object.sha;
  console.log(`   Base commit: ${parentSha.substring(0, 7)}`);

  const treeItems: any[] = [];
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
  
  let uploaded = 0;
  let failed = 0;
  
  for (const filePath of allFiles) {
    await delay(100);
    
    try {
      const content = fs.readFileSync(path.join(process.cwd(), filePath));
      const isText = !content.includes(0x00);
      
      const { data: blob } = await octokit.git.createBlob({
        owner, repo,
        content: isText ? content.toString('utf-8') : content.toString('base64'),
        encoding: isText ? 'utf-8' : 'base64'
      });
      
      treeItems.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.sha });
      uploaded++;
      
      if (uploaded % 20 === 0) {
        console.log(`   Progress: ${uploaded}/${allFiles.length}`);
      }
    } catch (err: any) {
      if (err.status === 403) {
        console.log(`   ⏳ Rate limited, waiting 3s...`);
        await delay(3000);
        try {
          const content = fs.readFileSync(path.join(process.cwd(), filePath));
          const isText = !content.includes(0x00);
          const { data: blob } = await octokit.git.createBlob({
            owner, repo,
            content: isText ? content.toString('utf-8') : content.toString('base64'),
            encoding: isText ? 'utf-8' : 'base64'
          });
          treeItems.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.sha });
          uploaded++;
        } catch {
          console.warn(`   ⚠️ Skipped: ${filePath}`);
          failed++;
        }
      } else {
        console.warn(`   ⚠️ Skipped: ${filePath}`);
        failed++;
      }
    }
  }

  console.log(`   ✓ Uploaded ${uploaded}, failed ${failed}`);

  if (treeItems.length === 0) {
    console.log('No files to push');
    return;
  }

  const { data: tree } = await octokit.git.createTree({
    owner, repo,
    tree: treeItems,
    base_tree: parentSha
  });

  const { data: commit } = await octokit.git.createCommit({
    owner, repo,
    message: 'Add remaining files (scripts, attached_assets, temp_repo)',
    tree: tree.sha,
    parents: [parentSha]
  });

  await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha });
  
  console.log(`✅ Push successful! Commit: ${commit.sha.substring(0, 7)}`);
}

pushRemainingFiles().catch(e => { console.error('❌ Failed:', e.message); process.exit(1); });
