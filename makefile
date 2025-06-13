-include .dev/.env
export

SHELL := /bin/bash
REPO_ROOT := $(shell git rev-parse --show-toplevel)

# Image & build configuration
VERSION ?= $(shell git tag -l --sort=-creatordate | head -n 1)
BUILD_INFO ?= dev-build $(shell git log -1 --pretty=format:'%h %ad' --date=short)
BUILD_PLATFORM ?= linux/amd64
# Set this to '--push' to enable image pushing, e.g. `make image IMAGE_EXTRA_ARGS="--push"`
IMAGE_EXTRA_ARGS ?= 

.EXPORT_ALL_VARIABLES:
.PHONY: help lint lint-fix run build generate clean image push check-vars helm-docs helm-package
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@figlet $@ || true
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: ## 🔍 Lint & format check only, use for CI
	@figlet $@ || true
	cd .dev/; npm install --silent
	npx --yes eslint -c .dev/eslint.config.mjs public/js
	npx --yes prettier --check --config .dev/.prettierrc public/js 
	go tool -modfile=.dev/tools.mod golangci-lint run -c .dev/golangci.yaml

lint-fix: ## ✨ Lint & try to format & fix
	@figlet $@ || true
	cd .dev/; npm install --silent
	npx --yes eslint -c .dev/eslint.config.mjs public/js --fix
	npx --yes prettier --write --config .dev/.prettierrc public/js
	go tool -modfile=.dev/tools.mod golangci-lint run -c .dev/golangci.yaml --fix

run: ## 🏃 Run application, used for local development
	@figlet $@ || true
	@go tool -modfile=.dev/tools.mod air -c .dev/air.toml

build: ## 🔨 Build application binary
	@figlet $@ || true
	CGO_ENABLED=0 GOOS=$(BUILD_OS) GOARCH=$(BUILD_ARCH) go build -o bin/kubeview ./server

clean: ## 🧹 Clean up and reset
	@figlet $@ || true
	@rm -rf tmp bin

image: check-vars ## 📦 Build container image from Dockerfile, with optional push
	@figlet $@ || true
	docker buildx build --file ./deploy/Dockerfile \
	--build-arg VERSION="$(VERSION)" \
	--build-arg BUILD_INFO="$(BUILD_INFO)" \
	--platform $(BUILD_PLATFORM) \
	$(IMAGE_EXTRA_ARGS) \
	--tag $(IMAGE_REG)/$(IMAGE_NAME):$(IMAGE_TAG) . 

helm-docs: ## 📜 Update docs & readme for Helm chart
	@figlet $@ || true
	docker run --rm --volume "$(REPO_ROOT)/deploy/helm/kubeview:/helm-docs" -u $(shell id -u) jnorwood/helm-docs:latest --sort-values-order file

helm-package: helm-docs ## 🔠 Package Helm chart and update index
	@figlet $@ || true
	helm package deploy/helm/kubeview -d deploy/helm
	helm repo index deploy/helm

# ===============================================

check-vars:
	@if [[ -z "${IMAGE_REG}" ]]; then echo "💥 Error! Required variable IMAGE_REG is not set!"; exit 1; fi
	@if [[ -z "${IMAGE_NAME}" ]]; then echo "💥 Error! Required variable IMAGE_NAME is not set!"; exit 1; fi
	@if [[ -z "${IMAGE_TAG}" ]]; then echo "💥 Error! Required variable IMAGE_TAG is not set!"; exit 1; fi
	@if [[ -z "${VERSION}" ]]; then echo "💥 Error! Required variable VERSION is not set!"; exit 1; fi
	@if [[ -z "${BUILD_INFO}" ]]; then echo "💥 Error! Required variable BUILD_INFO is not set!"; exit 1; fi
