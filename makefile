################################################################################
# Variables
################################################################################

SERVER_DIR := ./cmd
FRONTEND_DIR := ./web/client
VERSION := 0.1.20
BUILD_INFO := Manual build from makefile

# Most likely want to override these when calling `make image`
DOCKER_REG ?= ghcr.io
DOCKER_REPO ?= benc-uk/kubeview
DOCKER_TAG ?= latest
DOCKER_PREFIX := $(DOCKER_REG)/$(DOCKER_REPO)

.PHONY: image push build-frontend build-server lint lint-ci format format-ci

################################################################################
# Lint - check everything
################################################################################
lint: $(FRONTEND_DIR)/node_modules
	go get github.com/golangci/golangci-lint/cmd/golangci-lint
	golangci-lint run $(SERVER_DIR)/...
	cd $(FRONTEND_DIR); npm run lint-ci

################################################################################
# Lint - will try to fix errors & modify code
################################################################################
lint-fix: $(FRONTEND_DIR)/node_modules
	go get github.com/golangci/golangci-lint/cmd/golangci-lint
	golangci-lint run $(SERVER_DIR)/... --fix 
	cd $(FRONTEND_DIR); npm run lint

################################################################################
# Format - check everything
################################################################################
format: $(FRONTEND_DIR)/node_modules
	@test -z `gofmt -l $(SERVER_DIR)` || (gofmt -d $(SERVER_DIR) && exit 1)
	cd $(FRONTEND_DIR); npm run format-ci

################################################################################
# Format - will try to fix errors & modify code
################################################################################
format-fix: $(FRONTEND_DIR)/node_modules
	gofmt -w $(SERVER_DIR)
	cd $(FRONTEND_DIR); npm run format

################################################################################
# Build combined Docker image (API server plus frontend)
################################################################################
image:
	docker build  --file ./build/Dockerfile \
	--build-arg buildInfo="$(BUILD_INFO)" \
	--build-arg version="$(VERSION)" \
	--tag $(DOCKER_REG)/$(DOCKER_REPO):$(DOCKER_TAG) . 

################################################################################
# Push combined Docker image
################################################################################
push:
	docker push $(DOCKER_REG)/$(DOCKER_REPO):$(DOCKER_TAG)

################################################################################
# Build & bundle Frontend / Vue.js
################################################################################
build-frontend: $(FRONTEND_DIR)/node_modules
	cd $(FRONTEND_DIR); npm run build

$(FRONTEND_DIR)/node_modules: $(FRONTEND_DIR)/package.json
	cd $(FRONTEND_DIR); npm install --silent
	touch -m $(FRONTEND_DIR)/node_modules

$(FRONTEND_DIR)/package.json: 
	@echo "package.json was modified"

################################################################################
# Build server
################################################################################
build-server: 
	GO111MODULE=on CGO_ENABLED=0 GOOS=linux go build \
	-ldflags "-X main.version=\"$(VERSION)\" -X 'main.buildInfo=\"$(BUILD_INFO)\"'" \
	-o server $(SERVER_DIR)/...