#!/bin/bash

out=$(gofmt -l $1)
linecount=$(echo "$out" | wc -l)

if (( $linecount > 0 )); then
  while IFS= read -r line; do
    echo "::error::gofmt error in file: $line check logs for details"
  done <<< "$out"

  # Print actual diff and error details
  gofmt -d $1

  exit 1
fi