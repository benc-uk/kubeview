#!/bin/sh
# =============================================================================
# KubeView Installer Script
# Usage: curl -sL https://raw.githubusercontent.com/benc-uk/kubeview/main/scripts/install.sh | sh
# =============================================================================

set -e

REPO="benc-uk/kubeview"
BINARY_NAME="kubeview"
INSTALL_DIR="/usr/local/bin"

# Allow overriding install directory
if [ -n "$KUBEVIEW_INSTALL_DIR" ]; then
  INSTALL_DIR="$KUBEVIEW_INSTALL_DIR"
fi

# Detect OS
detect_os() {
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  case "$OS" in
    linux)   OS="linux" ;;
    darwin)  OS="darwin" ;;
    mingw*|msys*|cygwin*) OS="windows" ;;
    *)
      echo "💥 Error: Unsupported operating system: $OS"
      exit 1
      ;;
  esac
}

# Detect architecture
detect_arch() {
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64|amd64)  ARCH="amd64" ;;
    aarch64|arm64)  ARCH="arm64" ;;
    *)
      echo "💥 Error: Unsupported architecture: $ARCH"
      exit 1
      ;;
  esac
}

# Get the latest release version from GitHub
get_latest_version() {
  VERSION=$(curl -sI "https://github.com/${REPO}/releases/latest" | grep -i "^location:" | sed 's/.*tag\///' | tr -d '\r\n')

  if [ -z "$VERSION" ]; then
    echo "💥 Error: Could not determine the latest version"
    exit 1
  fi
}

# Download and install the binary
install() {
  detect_os
  detect_arch

  # Allow overriding the version
  if [ -z "$KUBEVIEW_VERSION" ]; then
    get_latest_version
  else
    VERSION="$KUBEVIEW_VERSION"
  fi

  ASSET_NAME="${BINARY_NAME}-${OS}-${ARCH}"
  if [ "$OS" = "windows" ]; then
    ASSET_NAME="${ASSET_NAME}.exe"
  fi

  DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/${ASSET_NAME}"

  echo "🚀 Installing KubeView ${VERSION}"
  echo "   OS:     ${OS}"
  echo "   Arch:   ${ARCH}"
  echo "   Target: ${INSTALL_DIR}/${BINARY_NAME}"

  # Create temp directory for download
  TMP_DIR=$(mktemp -d)
  trap 'rm -rf "$TMP_DIR"' EXIT

  echo "⬇️  Downloading ${DOWNLOAD_URL}..."
  HTTP_CODE=$(curl -sL -w "%{http_code}" -o "${TMP_DIR}/${ASSET_NAME}" "$DOWNLOAD_URL")

  if [ "$HTTP_CODE" != "200" ]; then
    echo "💥 Error: Failed to download binary (HTTP ${HTTP_CODE})"
    echo "   URL: ${DOWNLOAD_URL}"
    echo "   Check that version '${VERSION}' exists and has a binary for ${OS}/${ARCH}"
    exit 1
  fi

  # Make binary executable
  chmod +x "${TMP_DIR}/${ASSET_NAME}"

  # Install to target directory
  if [ -w "$INSTALL_DIR" ]; then
    mv "${TMP_DIR}/${ASSET_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
  else
    echo "📦 Installing to ${INSTALL_DIR} requires elevated permissions..."
    sudo mv "${TMP_DIR}/${ASSET_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
  fi

  echo "✅ KubeView ${VERSION} installed successfully to ${INSTALL_DIR}/${BINARY_NAME}"
}

install
