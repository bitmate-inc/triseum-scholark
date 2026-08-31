#!/bin/bash

set -e
set -u

function create_user_and_database() {
	local DB_NAME=$1

	echo "Creating user and database \"$DB_NAME\""

	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
		CREATE USER "$DB_NAME";
		CREATE DATABASE "$DB_NAME";
		GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_NAME";
	EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
	echo "Multiple database creation requested: '$POSTGRES_MULTIPLE_DATABASES'"

	for DB in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
		create_user_and_database "$DB"
	done

	echo "Multiple databases created"
fi
