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
