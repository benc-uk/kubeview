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
- Use the package `github.com/benc-uk/go-rest-api` where applicable for API response handling and error management.
- Always handle errors explicitly and log them with appropriate context using `log.Printf()`.
- Use `context.TODO()` for context parameters when the context is not yet implemented, but prefer proper context propagation.
- When working with Kubernetes client-go, use `schema.GroupVersionResource` for dynamic client operations.
- Structure API handlers to return early on errors using guard clauses.
- Use the `chi` router for HTTP routing and parameter extraction with `chi.URLParam()`.
- Use meaningful variable names like `gvr` for GroupVersionResource, `ns` for namespace, `k` for Kubernetes service receiver.
- Prefer composition over inheritance - embed structs or interfaces when extending functionality.
- Use `make()` with capacity when you know the approximate size of slices/maps to improve performance.
- When building configuration from environment variables, provide sensible defaults and use `strconv` package for type conversions.
- Structure HTTP responses using a consistent JSON format and use appropriate HTTP status codes.
- When creating struct types, use clear, descriptive names and document exported fields with comments.
- Organize imports logically: standard library first, then third-party packages, then local packages with blank lines between groups.
- Use comprehensive file-level comments with banner formatting (`// ====...====`) to describe the purpose of each file.
- When creating HTTP middleware, use method receivers on the main API struct for consistency.
- Use enum-style constants with custom string types for event types and similar categorical data.
- Always validate required parameters (like namespace, clientID) at the beginning of HTTP handlers.
- Use the `problem` package for consistent error responses in APIs rather than generic `http.Error()`.
- Structure configuration parsing in a separate function that returns a config struct with all defaults applied.
- Use proper resource cleanup and context cancellation for long-running operations like informers.
- When creating factory patterns, use clear naming like `NewServiceName()` for constructors.
- Use blank identifiers (`_, _`) when you need to ignore return values but want to be explicit about it.
