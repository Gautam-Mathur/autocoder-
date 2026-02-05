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
  ).then(res => res.json()).then((data: { items?: Array<any> }) => data.items?.[0]);

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

async function main() {
  const octokit = await getGitHubClient();
  const owner = 'Gautam-Mathur';
  const repo = 'autocoder-';
  
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  const filesToPush = [
    'electron/main.ts',
    'electron/preload.ts',
    'electron/tsconfig.json',
    'docs/electron/03-PROBLEMS-AND-SOLUTIONS.md',
    'docs/electron/04-RUNNING-GUIDE.md',
  ];

  console.log(`Pushing ${filesToPush.length} files with ES module fixes...`);

  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: 'heads/main'
  });
  
  const latestCommitSha = ref.object.sha;
  console.log(`Base commit: ${latestCommitSha.substring(0, 7)}`);

  const treeItems: any[] = [];
  
  for (const filePath of filesToPush) {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ! Skipped (not found): ${filePath}`);
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    const { data: blob } = await octokit.git.createBlob({
      owner,
      repo,
      content,
      encoding: 'utf-8'
    });
    
    treeItems.push({
      path: filePath,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
    
    console.log(`  ✓ ${filePath}`);
  }

  if (treeItems.length === 0) {
    console.log('No files to push');
    return;
  }

  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    tree: treeItems,
    base_tree: latestCommitSha
  });

  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'Fix ES module compatibility for Electron\n\n- Update tsconfig to output ESNext modules instead of CommonJS\n- Add .js extensions to local imports in main.ts\n- Add __dirname replacement using fileURLToPath for ES modules\n- Update documentation with ES module error fix\n- Add Windows-specific commands to Running Guide',
    tree: newTree.sha,
    parents: [latestCommitSha]
  });

  await octokit.git.updateRef({
    owner,
    repo,
    ref: 'heads/main',
    sha: newCommit.sha
  });

  console.log(`\n✓ Successfully pushed to GitHub!`);
  console.log(`  https://github.com/${owner}/${repo}/commit/${newCommit.sha}`);
}

main().catch(console.error);
