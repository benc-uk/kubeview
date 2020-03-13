#!/bin/bash

#
# Hacky bash script to run gofmt and report any files with problems 
# Will show up as GitHub Action annotations in the workflow
# Ben Coleman
#
set -e
out=$(gofmt -l $1)
linecount=$(echo "$out" | sed '/^\s*$/d' | wc -l)

if (( $linecount > 0 )); then
  while IFS= read -r line; do
    echo "::error::gofmt error in file: $line check logs for details"
  done <<< "$out"

  # Print actual diff and error details
  gofmt -d $1

  exit 1
fi