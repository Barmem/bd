all: fmt check
	go build

deps_release:
	go install github.com/nicksnyder/go-i18n/v2/goi18n@latest

extract: tr_extract

bump_deps:
	go get -u ./...
	cd frontend && yarn upgrade-interactive --latest

check: lint_golangci static lint_ts

lint_golangci:
	@golangci-lint run --timeout 3m

lint_ts:
	cd frontend && yarn run eslint:check && yarn prettier src/ --check

static:
	@staticcheck -go 1.20 ./...

check_deps:
	go install github.com/daixiang0/gci@latest
	go install mvdan.cc/gofumpt@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.54.2
	go install honnef.co/go/tools/cmd/staticcheck@latest

test:
	go test ./...

tr_extract:
	goi18n extract -outdir internal/tr/ -format yaml

tf_new_lang:
	goi18n merge internal/tr/active.en.toml translate.es.toml

tr_gen_translate:
	goi18n merge -format yaml -outdir internal/tr/ internal/tr/active.*.yaml

tr_merge:
	goi18n merge -format yaml -outdir internal/tr/ internal/tr/active.*.yaml internal/tr/translate.*.yaml

fmt:
	gci write . --skip-generated -s standard -s default
	gofumpt -l -w .
	cd frontend && yarn prettier src/ --write

watch:
	cd frontend && yarn run watch

deps:
	cd frontend && yarn install
	go mod download

build:
	cd frontend && yarn run build
	go build
