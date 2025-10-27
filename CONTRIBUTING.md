# Contributing Guide

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/vladslugin987/fantasy-gaming-store.git
   cd fantasy-gaming-store
   ```

2. Set up upstream:
   ```bash
   git remote add upstream https://github.com/vladslugin987/fantasy-gaming-store.git
   ```

3. Switch to develop branch:
   ```bash
   git checkout -b develop
   git pull origin develop
   ```

## Development Workflow

### Creating Feature Branches
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### After Making Changes
```bash
git add .
git commit -m "add description of changes"
git push origin feature/your-feature-name
```

### Pull Request Process
- Go to GitHub repository
- Click "Compare & pull request"
- Select your feature branch
- Add description of changes
- Click "Create pull request"

## Commit Style

Use simple commit messages:
- `add new feature` - adding functionality
- `fix login bug` - fixing issues
- `update styling` - styling changes
- `refactor code` - code improvements

## Branch Structure

- `main` - protected main branch
- `develop` - development branch

## Contacts

- Vladislav Slugin: @vladslugin987
- Sofie Halbedl: @Sofotschka
