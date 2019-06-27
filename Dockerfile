# ================================================================================================
# === Stage 1: Build and bundle the Vue.js app with Vue CLI 3 ====================================
# ================================================================================================
FROM node:10-alpine as vue-build
ARG sourceDir="client"

WORKDIR /build

# Install all the Vue.js dev tools & CLI, and our app dependencies 
COPY ${sourceDir}/package*.json ./
RUN npm install --silent

# Copy in the Vue.js app source
COPY ${sourceDir}/.env.production .
COPY ${sourceDir}/.eslintrc.js .
COPY ${sourceDir}/public ./public
COPY ${sourceDir}/src ./src

# Run Vue CLI build & bundle, and output to ./dist
RUN npm run build

# ================================================================================================
# === Stage 2: Build Golang API server and host for Vue app ======================================
# ================================================================================================
FROM golang:1.11-alpine as go-build
ARG sourceDir="server"

# Enable Go modules
ENV GO111MODULE=on
WORKDIR /build

# Install system dependencies
RUN apk update && apk add git gcc musl-dev

# Fetch and cache Go modules
COPY ${sourceDir}/go.mod .
COPY ${sourceDir}/go.sum .
RUN go mod download

# Copy in Go source files
COPY ${sourceDir}/ .

# Now run the build
# Disabling cgo results in a fully static binary that can run without C libs
RUN GO111MODULE=on CGO_ENABLED=0 GOOS=linux go build -o server

# ================================================================================================
# === Stage 3: Bundle server exe and Vue dist in runtime image ===================================
# ================================================================================================
FROM scratch
WORKDIR /app 
EXPOSE 8000

# Copy in output from Vue bundle (the dist)
# Copy the server binary
COPY --from=vue-build /build/dist ./frontend
COPY --from=go-build /build/server . 

# That's it! Just run the server with incluster mode enabled
CMD [ "./server", "-incluster"]