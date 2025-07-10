## JavaScript Copilot Instructions

- When writing JavaScript code, always use `const` or `let` for variable declarations instead of `var`.
- Use arrow functions for anonymous functions to maintain a consistent coding style.
- Always use template literals (`` ` ``) for string interpolation instead of concatenation with `+`.
- Use destructuring assignment for objects and arrays where applicable to improve readability.
- Prefer using `for...of` loops for iterating over arrays instead of traditional `for` loops.
- Use `async/await` for asynchronous code instead of callbacks or `.then()` chaining for better readability.
- Do not ever assume you can use log.error() or log.warn() log.info() - these are not available in the codebase. Use console.log() instead or console.error() for error logging.
- Never add semicolons at the end of lines, as they are not used in the codebase.

## Go Copilot Instructions

- When writing Go code, always use `:=` for variable declarations unless the variable is already declared.
- Use `log.Printf()` and `log.Println()` for logging instead of `fmt.Printf()` or `fmt.Println()`.
- Use descriptive emoji prefixes in log messages to categorize them (e.g., `🚀` for startup, `💥` for errors, `✅` for success, `⚓` for cluster operations, `🔍` for data fetching).
- Avoid using global variables unless absolutely necessary; prefer passing variables as function parameters or through struct fields.
- When creating struct methods, use pointer receivers for methods that modify the struct or for consistency when other methods use pointer receivers.
- Always handle errors explicitly and log them with appropriate context using `log.Printf()`.
- Use `context.TODO()` for context parameters when the context is not yet implemented, but prefer proper context propagation.
- When working with Kubernetes client-go, use `schema.GroupVersionResource` for dynamic client operations.
- Structure API handlers to return early on errors using guard clauses.
- Use the `chi` router for HTTP routing and parameter extraction with `chi.URLParam()`.
- When working with unstructured Kubernetes objects, always call `SetManagedFields(nil)` to clean up clutter before returning data.
- Use meaningful variable names like `gvr` for GroupVersionResource, `ns` for namespace, `k` for Kubernetes service receiver.
- Prefer composition over inheritance - embed structs or interfaces when extending functionality.
- Use `make()` with capacity when you know the approximate size of slices/maps to improve performance.
- When building configuration from environment variables, provide sensible defaults and use `strconv` package for type conversions.
- Structure HTTP responses using a consistent JSON format and use appropriate HTTP status codes.

## PR Summary Guidelines

- When asked to provide a summary of a pull request (or PR), use the following prompt to generate the response:
  "Generate a concise summary of the changes made in this branch. Only run one command, the following three commands `git log main..HEAD --oneline` `git log main..HEAD --pretty=format:"%h - %s%n%b"` `git diff --name-only main..HEAD` to get changes, and do not run any other commands. If you are on main branch stop the process. Do not check inside files for changes. The summary should include the following sections:
- **✨ Summary**: A overview of the changes made.
- **🔧 Changes**: A list of files changed, added, or deleted. Try to include a one line summary of the file beside it.
- **📝 Documentation**: Any documentation updates made, file by file.
- **🆗 Impact**: Any potential impact of the changes on the system or users. Try to always include this section
  Your response needs to be wrapped in a markdown code block. Do not include any other text or explanations outside of the code block." When complete ask the user if they want to create a pull request in GitHub using GitHub MCP tool and include the summary in the new PR.
