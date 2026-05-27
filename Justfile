set shell := ["bash", "-eu", "-o", "pipefail", "-c"]
export PATH := "./node_modules/.bin:" + env_var("HOME") + "/.local/share/mise/shims:/opt/homebrew/bin:/usr/local/bin:" + env_var("PATH")

# List available recipes.
default:
    @just --list --unsorted

# Print local tool versions and setup hints.
doctor:
    @printf "node: "
    @if command -v node >/dev/null; then node --version; else echo "missing"; fi
    @printf "npm: "
    @if command -v npm >/dev/null; then npm --version; else echo "missing"; fi
    @printf "just: "
    @if command -v just >/dev/null; then just --version; else echo "missing"; fi
    @if [ -d node_modules ]; then \
        echo "node_modules: present"; \
    else \
        echo "node_modules: missing; run: just install"; \
    fi
    @if [ -f .env.local ] || [ -f .env ]; then \
        echo "env: local env file present"; \
    else \
        echo "env: no .env.local or .env found; Buttondown auth may require setup"; \
    fi

# Install npm dependencies.
install:
    npm install

# Install dependencies and create .env.local from .env.example when needed.
bootstrap: install
    @if [ ! -f .env.local ] && [ -f .env.example ]; then \
        cp .env.example .env.local; \
        echo "Created .env.local from .env.example"; \
    elif [ -f .env.local ]; then \
        echo ".env.local already exists"; \
    else \
        echo "No .env.example found; skipped env file setup"; \
    fi

# Start the Next.js development server.
dev:
    npm run dev

# Build the production app.
build:
    npm run build

# Start the production app after a build.
start:
    npm run start

# Run the fast local quality gate.
check:
    npm run content:validate
    npm run lint
    npm run typecheck
    npm run format

# Run the full local CI gate, including the app and Storybook builds.
ci:
    npm run content:validate
    npm run lint
    npm run typecheck
    npm run format
    npm run build
    npm run storybook:check

# Validate issue frontmatter, Buttondown-safe Markdown, templates, and snippets.
content-validate:
    npm run content:validate

# Regenerate Buttondown emails and snippets from source content.
content-buttondown:
    npm run content:buttondown

# Validate content and regenerate Buttondown output.
content: content-validate content-buttondown

# Run ESLint.
lint:
    npm run lint

# Run TypeScript checks.
typecheck:
    npm run typecheck

# Check Prettier formatting.
format:
    npm run format

# Apply Prettier formatting.
format-write:
    npm run format:write

# Run Storybook locally.
storybook:
    npm run storybook

# Build Storybook.
storybook-build:
    npm run storybook:build

# Run Storybook browser tests.
storybook-test:
    npm run storybook:test

# Build Storybook and run its browser tests.
storybook-check:
    npm run storybook:check

# Run the local Buttondown CLI with extra arguments.
buttondown *args:
    npm run buttondown -- {{ args }}

# Authenticate the repo-local Buttondown CLI.
buttondown-login:
    npm run buttondown:login

# Log out of the repo-local Buttondown CLI.
buttondown-logout:
    npm run buttondown:logout

# Pull live Buttondown emails, media, and branding into buttondown/.
buttondown-pull:
    npm run buttondown:pull

# Validate content and regenerate managed Buttondown output.
buttondown-prepare:
    npm run buttondown:prepare

# Push generated drafts and snippets to Buttondown via the repo-owned API sync.
buttondown-push:
    npm run buttondown:push

# Dry-run retired snippet pruning against Buttondown.
buttondown-prune-snippets *args:
    npm run buttondown:prune-snippets -- {{ args }}

# Read Buttondown back through the API and verify managed generated content.
buttondown-verify:
    npm run buttondown:verify

alias validate := content-validate
alias generate := content-buttondown
alias fmt := format
alias fmt-write := format-write
alias storybook-ci := storybook-check
alias bd := buttondown
alias bd-login := buttondown-login
alias bd-pull := buttondown-pull
alias bd-push := buttondown-push
alias bd-prune-snippets := buttondown-prune-snippets
alias bd-verify := buttondown-verify
