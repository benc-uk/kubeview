#!/bin/bash

out=$(gofmt -d $1)
linecount=$(echo "$out" | wc -l)

if (( $linecount > 1 )); then
  echo "::error::$out"
  exit 1
fi