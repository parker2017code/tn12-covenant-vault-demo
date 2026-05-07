# GitHub Hosting And Repo Operations

This repo is a static TN12 testnet prototype plus local Node scripts. GitHub should host the source, docs, fixtures, and static browser UI. It should not host `.local/tn12-wallet.json`, private keys, shell history, or any mainnet wallet material.

## Publish Scope

Include:

- browser UI: `index.html`, `styles.css`, `app.js`;
- source modules: `src/`;
- runnable scripts: `scripts/`;
- testnet fixtures and proof artifacts: `fixtures/`, `artifacts/`;
- Silverscript templates: `contracts/`;
- operating docs: `README.md`, `AGENTS.md`, `CONTEXT.md`, and `docs/`;
- package metadata: `package.json`, `package-lock.json`.

Exclude:

- `.local/`;
- `node_modules/`;
- private key material;
- mainnet wallet data;
- temporary screenshots, logs, and local browser profiles.

## First Publish

From this repo root:

```sh
git status --short
npm run check:all
npm run tx:verify
gh repo create parker2017code/tn12-covenant-vault-demo --public --source=. --remote=origin --push
```

If the repo already exists, add the remote and push:

```sh
git remote add origin git@github.com:parker2017code/tn12-covenant-vault-demo.git
git push -u origin main
```

Use a private repo instead if the repo ever gains sensitive operational notes or wallet-adjacent material that is not safe for public learning.

## GitHub Pages

The browser UI can be served from the repo root because the app uses static files only.

Recommended Pages settings:

- Source: deploy from a branch.
- Branch: `main`.
- Folder: `/ (root)`.
- Custom domain: none at first.
- Enforce HTTPS: enabled after GitHub provisions the Pages URL.

Enable with GitHub CLI after the remote exists:

```sh
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/parker2017code/tn12-covenant-vault-demo/pages \
  -f source.branch=main \
  -f source.path=/
```

If Pages already exists, update it:

```sh
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/parker2017code/tn12-covenant-vault-demo/pages \
  -f source.branch=main \
  -f source.path=/
```

Check Pages state:

```sh
gh api /repos/parker2017code/tn12-covenant-vault-demo/pages
```

## Editing Flow

Use normal local edits first, then push.

```sh
npm install
npm run check:all
npm run tx:verify
git status --short
git diff --check
git add <changed files>
git commit -m "Describe the TN12 app change"
git push
```

For UI changes:

```sh
npm run serve
npm run check:ui
```

Open the local preview at:

```txt
http://127.0.0.1:4176/
```

## Accessing Repo Settings

Browser path after the GitHub repo exists:

```txt
https://github.com/parker2017code/tn12-covenant-vault-demo/settings
```

Important settings:

- General: repo name, description, visibility, features.
- Pages: static hosting branch/folder and HTTPS.
- Collaborators and teams: who can push or administer.
- Branches: protection rules for `main` after the first stable push.
- Secrets and variables: avoid unless a future workflow truly needs them.
- Actions: enable only if CI is added.

Suggested description:

```txt
TN12 Kaspa covenant vault and assurance-contract prototype with accepted testnet proof transactions.
```

Suggested topics:

```txt
kaspa, tn12, covenants, silverscript, testnet, blockdag, assurance-contracts
```

## Branch Protection

After the first hosted version is stable, protect `main`:

- require pull requests before merging;
- require `npm run check:all`;
- require `npm run tx:verify` only if CI has network access and TN12 API stability is acceptable;
- block force pushes;
- allow admins to bypass only for emergency docs fixes.

Do not add a required Pages deployment check until Pages is enabled and stable.

## GitHub Actions Next Step

Add CI after the first push:

```yaml
name: check
on:
  pull_request:
  push:
    branches: [main]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run check:all
```

Keep `tx:verify` as a separate workflow step only if occasional public TN12 API downtime will not block ordinary docs/UI work.

## Safety Rules

- Never commit `.local/tn12-wallet.json`.
- Never paste private keys into docs, issues, pull requests, screenshots, or chat.
- Keep every claim labeled as TN12 testnet unless it is live Kaspa mainnet behavior.
- Keep actual broadcasting behind explicit commands. `npm run tx:submit:dry` must remain the default inspection path.
- If this becomes public, assume every artifact and fixture is educational and permanently visible.

## Immediate Next Steps

1. Run `npm run check:all`, `npm run tx:verify`, and `git diff --check`.
2. Commit the current TN12 proof-app work.
3. Create `parker2017code/tn12-covenant-vault-demo` on GitHub and push `main`.
4. Enable GitHub Pages from `main` root.
5. Add CI and branch protection after the first hosted page is verified.
