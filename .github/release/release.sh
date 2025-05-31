#!/bin/bash

# **** Used for project maintenance only ****
# Script used to release to GitHub 

VERSION=$1
PREV_VERSION=$2

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "gh CLI is not installed. Please install it to use this script."
  exit 1
fi

# check input parameters
if [[ -z "$VERSION" ]] || [[ -z "$PREV_VERSION" ]]; then
  echo "Usage: $0 <version> <previous_version>"
  echo "Example: $0 1.2.3 1.2.2"
  exit 1
fi

# **** Used for project maintenance only ****
# Script used to release to GitHub 

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# check if version and previous version are supplied
if [[ -z "$VERSION" ]]; then
  echo "Error! Supply version tag!"
  exit 1
fi
if [[ -z "$PREV_VERSION" ]]; then
  echo "Error! Supply previous version tag!"
  exit 1
fi

gh release create "$VERSION" --title "v$VERSION" \
  --notes-start-tag "$PREV_VERSION" \
  --generate-notes \
  --target main \
  -F "$DIR"/release-notes.md
