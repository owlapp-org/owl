docker compose -f docker-compose-test.yml run --rm bandit
docker compose -f docker-compose-test.yml run --rm test
docker compose -f docker-compose-test.yml down

cd owl/webapp && yarn test && cd -
