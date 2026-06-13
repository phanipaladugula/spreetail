# GitHub Setup Instructions

Since the GitHub MCP doesn't have repository creation permissions, please follow these steps:

## 1. Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `spreetail`
3. Description: `Expense sharing application like Splitwise`
4. Make it Public or Private (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## 2. Connect Local Repository

Once created, run these commands:

```bash
cd C:\Users\phani\VScode\Projects\Spreetail
git remote add origin https://github.com/phanipaladugula/spreetail.git
git branch -M main
git push -u origin main
```

## 3. For Future Pushes

After each commit:
```bash
git add .
git commit -m "feat: your message"
git push origin main
```

The project is being built with feature-by-feature commits as planned!