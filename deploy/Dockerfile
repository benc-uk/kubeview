# ==============================================================
# Build stage
# For the multi-platform build, see this guide:
# https://docs.docker.com/build/building/multi-platform/#cross-compiling-a-go-application
# ==============================================================
FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS build
ARG VERSION="0.0.0"
ARG BUILD_INFO="Unset"
ARG CGO_ENABLED=0
ARG TARGETOS
ARG TARGETARCH

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY server/ ./server/

# Build the Go binary for the specified platform
# CGO_ENABLED=0 is used to ensure a statically linked binary
# TARGETOS and TARGETARCH are set to build for the desired platform
# The -ldflags option is used to embed version and build info into the binary
RUN CGO_ENABLED=$CGO_ENABLED \
  GOOS=$TARGETOS \
  GOARCH=$TARGETARCH \
  go build -o ./kubeview \
  -ldflags "-X 'main.version=$VERSION' -X 'main.buildInfo=$BUILD_INFO'" \
  ./server

# ==============================================================
# Final minimal image
# Note: Use alpine rather than scratch for easier debugging
# ==============================================================
FROM --platform=$BUILDPLATFORM alpine:3.22

WORKDIR /app

# Copy binary and public assets
COPY --from=build /build/kubeview .
# Copy public web assets
COPY public/ ./public/

ENV PORT=8000
EXPOSE 8000

# Run the binary
CMD ["./kubeview"]