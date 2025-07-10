#!/bin/bash

# This script summarizes the changes in the current branch compared to the main branch
# and formats the output for GitHub Copilot.

# Get the current branch name
current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" == "main" ]; then
  echo "You are on the main branch. No changes to summarize."
  exit 0
fi

# Check if the branch is pushed to the remote
if ! git show-ref --verify --quiet refs/remotes/origin/"$current_branch"; then
  echo "The branch '$current_branch' is not pushed to the remote. Please push your changes first."
  exit 1
fi

# Get the list of changed files
changed_files=$(git diff --name-only main..HEAD)  
if [ -z "$changed_files" ]; then
  echo "No changes detected compared to the main branch."
  exit 0
fi

# Get the commit messages
commit_messages=$(git log main..HEAD --pretty=format:"%h - %s%n%b")

echo -e "Changed files:\n$changed_files"
echo -e "--------------------\nCommit messages:\n$commit_messages"