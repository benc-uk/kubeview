# ================================================================================================
# === Stage 1: Build and bundle the Vue.js app with Vue CLI 3 ====================================
# ================================================================================================
FROM node:16-alpine as vue-build
ARG TARGETARCH
ARG sourceDir="web/client"

WORKDIR /build

# Install all the Vue.js dev tools & CLI, and our app dependencies 
COPY ${sourceDir}/package*.json ./
RUN npm install --silent

# Copy in the Vue.js app source
COPY ${sourceDir}/.env.production .
COPY ${sourceDir}/.eslintrc.js .
COPY ${sourceDir}/public ./public
COPY ${sourceDir}/src ./src

# Carry out Vue CLI build & bundle, this will output to ./dist
RUN npm run build

# ================================================================================================
# === Stage 2: Build Golang API server and host for Vue app ======================================
# ================================================================================================
FROM golang:1.23-alpine as go-build
ARG TARGETARCH
WORKDIR /build
ARG GO_PACKAGE="github.com/benc-uk/kubeview/cmd/server"
ARG VERSION="0.0.0"
ARG BUILD_INFO="Not set"

ENV PORT 8000

# Install system dependencies
RUN apk update && apk add git gcc musl-dev

# Fetch and cache Go modules
COPY go.mod .
COPY go.sum .
# Copy in Go source files
COPY cmd/ ./cmd

# Now run the build
# Disabling cgo results in a fully static binary that can run without C libs
# Also inject version and build details 
RUN GO111MODULE=on CGO_ENABLED=0 GOOS=linux go build \
    -ldflags "-X main.version=$VERSION -X 'main.buildInfo=$BUILD_INFO'" \
    -o server \
    $GO_PACKAGE

# ================================================================================================
# === Stage 3: Bundle server exe and Vue dist in runtime image ===================================
# ================================================================================================
FROM scratch
WORKDIR /app 

# Copy in output from Vue bundle (the dist)
COPY --from=vue-build /build/dist ./frontend
# Copy the Go server binary
COPY --from=go-build /build/server . 

EXPOSE 8000

# That's it! Just run the server 
CMD [ "./server"]
