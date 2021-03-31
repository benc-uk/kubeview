################################################################################
# Variables
################################################################################

SERVER_DIR := ./cmd
FRONTEND_DIR := ./web/client
VERSION := 0.1.20
BUILD_INFO := Manual build from makefile

# Most likely want to override these when calling `make image`
IMAGE_REG ?= ghcr.io
IMAGE_REPO ?= benc-uk/kubeview
IMAGE_TAG ?= latest
IMAGE_PREFIX := $(IMAGE_REG)/$(IMAGE_REPO)

.PHONY: help image push build-frontend build-server lint lint-fix
.DEFAULT_GOAL := help


################################################################################
help:  ## This help message :)
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'


################################################################################
lint: $(FRONTEND_DIR)/node_modules  ## Lint & format, will not fix but sets exit code on error
	@$(GOLINT_PATH) > /dev/null || cd $(SRC_DIR); go get github.com/golangci/golangci-lint/cmd/golangci-lint
	go get github.com/golangci/golangci-lint/cmd/golangci-lint; golangci-lint run --modules-download-mode=mod $(SERVER_DIR)/...
	cd $(FRONTEND_DIR); npm run lint
	# un-f**k the mod file after golangci-lint has mangled it
	go mod tidy


################################################################################
lint-fix: $(FRONTEND_DIR)/node_modules  ## Lint & format, will try to fix errors and modify code
	@$(GOLINT_PATH) > /dev/null || cd $(SRC_DIR); go get github.com/golangci/golangci-lint/cmd/golangci-lint
	go get github.com/golangci/golangci-lint/cmd/golangci-lint
	golangci-lint run --modules-download-mode=mod --fix $(SERVER_DIR)/...
	cd $(FRONTEND_DIR); npm run lint-fix
	# un-f**k the mod file after golangci-lint has mangled it
	go mod tidy


################################################################################
image:  ## Build combined container image (API server plus frontend)
	docker build  --file ./build/Dockerfile \
	--build-arg BUILD_INFO="$(BUILD_INFO)" \
	--build-arg VERSION="$(VERSION)" \
	--tag $(IMAGE_PREFIX):$(IMAGE_TAG) . 


################################################################################
push:  ## Push combined container image
	docker push $(IMAGE_PREFIX):$(IMAGE_TAG)


################################################################################
build-frontend: $(FRONTEND_DIR)/node_modules  ## Build & bundle Frontend / Vue.js
	cd $(FRONTEND_DIR); npm run build

$(FRONTEND_DIR)/node_modules: $(FRONTEND_DIR)/package.json
	cd $(FRONTEND_DIR); npm install --silent
	touch -m $(FRONTEND_DIR)/node_modules

$(FRONTEND_DIR)/package.json: 
	@echo "package.json was modified"


################################################################################
build-server:  ## Build Go API server
	GO111MODULE=on CGO_ENABLED=0 GOOS=linux go build \
	-ldflags "-X main.version=\"$(VERSION)\" -X 'main.buildInfo=\"$(BUILD_INFO)\"'" \
	-o server $(SERVER_DIR)/...