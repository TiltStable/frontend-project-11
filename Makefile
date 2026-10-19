.PHONY: install develop build preview lint lint-fix

install:
	npm ci

develop:
	npm run dev

build:
	npm run build

preview:
	npm run preview

lint:
	npx oxlint && npx oxfmt --ignore-path=.oxfmtignore --check

lint-fix:
	npx oxfmt && npx oxlint --fix
