help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

compose-up:	## run within container see compose.yml file.
	docker compose up

compose-down: ## stop running container
	docker compose down

db-migrate: ## run database migrasions. eg. make db-migrate message="initial migration"
	poetry run flask db migrate -m "$(message)" -d owl/server/app/migrations

db-revision-autogenerate: ## auto generate database migrations.
	poetry run flask db revision --autogenerate -d owl/server/app/migrations

db-upgrade: ## run alembic upgrade
	poetry run flask db upgrade -d owl/server/app/migrations

db-auto-upgrade: db-revision-autogenerate db-upgrade ## auto generate migrations and run them.

lint: ## check linting
	ruff check

test: lint ## run tests
	./test.sh

build: test ## build
	./build.sh

publish: build ## publish to pypi
	poetry publish

patch: build ## generate a patch version in /dist
	poetry version patch

doc-start:	## start documentation server for development
	cd doc && yarn start
