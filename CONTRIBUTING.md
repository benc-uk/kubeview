# Welcome

Thanks for your interest in this project! Contributions are welcome — that's why it's on GitHub 😃

A few things to keep in mind:

- This is a personal project, not maintained by a team or organization.
- It may take some time for the maintainer to reply to issues or review PRs — they have a day job and may not have looked at the code recently.
- The code is not intended to be production-grade or bulletproof.

# Contributing

There are several ways to contribute to this project, and effort has been made to keep the process as easy and transparent as possible:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## All code changes happen through pull requests (PRs)

Pull requests are the best way to propose changes to the codebase, using the standard [GitHub Flow](https://guides.github.com/introduction/flow/index.html).

Some PR guidance:

- Keep PRs small and focused on a single feature or change, with discrete commits. Use multiple PRs if needed.
- If you're thinking of adding a feature via a PR, please create an issue first so it can be discussed.

High-level steps:

1. Fork the repo and create your branch from `main`.
2. If you've changed APIs, update the documentation.
3. Ensure the test suite passes (run `make test`).
4. Make sure your code lints (run `make lint`).
5. Submit your pull request!

## Contributions are licensed under MIT

When you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers this project.

## Report bugs using GitHub Issues

This project uses GitHub Issues to track bugs. Report a bug by [opening a new issue](./issues/new/choose).

## Write detailed bug reports

**Great bug reports** tend to include:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Include sample code if you can, even a snippet
- What you expected to happen
- What actually happened
- Notes (e.g. why you think this might be happening, or things you tried that didn't work)

## Use a consistent coding style

Run `make lint-fix` to format the code and fix any linting issues. A [Prettier](https://prettier.io/) configuration file is included in the project.

# References

This document was adapted from the open-source contribution guidelines found in [this gist](https://gist.github.com/briandk/3d2e8b3ec8daf5a27a62).
