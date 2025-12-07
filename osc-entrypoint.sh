#!/bin/bash
# Note: This script requires bash for regex matching and BASH_REMATCH array support
set -e

# Database URL Parsing - Parse single DATABASE_URL into component variables
if [ -n "$DATABASE_URL" ]; then
  echo "Parsing DATABASE_URL into component environment variables..."
  
  # Parse the database URL using regex patterns
  if [[ "$DATABASE_URL" =~ ^([^:]+)://([^:]*):?([^@]*)@([^:]+):([0-9]+)/?(.*)$ ]]; then
    DB_SCHEME="${BASH_REMATCH[1]}"
    DB_USER="${BASH_REMATCH[2]}"
    DB_PASS="${BASH_REMATCH[3]}"
    DB_HOST="${BASH_REMATCH[4]}"
    DB_PORT="${BASH_REMATCH[5]}"
    DB_NAME="${BASH_REMATCH[6]}"
    
    # Export standard database environment variables
    export DB_HOST="$DB_HOST"
    export DB_PORT="$DB_PORT"
    export DB_USER="$DB_USER"
    export DB_PASSWORD="$DB_PASS"
    export DB_NAME="$DB_NAME"
    
    echo "Set DB_HOST=$DB_HOST"
    echo "Set DB_PORT=$DB_PORT"
    echo "Set DB_USER=$DB_USER"
    echo "Set DB_PASSWORD=[REDACTED]"
    echo "Set DB_NAME=$DB_NAME"
    
    # Set database-type specific variables based on scheme
    case "$DB_SCHEME" in
      "postgresql"|"postgres")
        export PGHOST="$DB_HOST"
        export PGPORT="$DB_PORT"
        export PGUSER="$DB_USER"
        export PGPASSWORD="$DB_PASS"
        export PGDATABASE="$DB_NAME"
        export POSTGRES_URL="$DATABASE_URL"
        echo "Set PostgreSQL-specific environment variables"
        ;;
      "mysql")
        export MYSQL_HOST="$DB_HOST"
        export MYSQL_PORT="$DB_PORT"
        export MYSQL_USER="$DB_USER"
        export MYSQL_PASSWORD="$DB_PASS"
        export MYSQL_DATABASE="$DB_NAME"
        export MYSQL_URL="$DATABASE_URL"
        echo "Set MySQL-specific environment variables"
        ;;
      "mariadb")
        export MARIADB_HOST="$DB_HOST"
        export MARIADB_PORT="$DB_PORT"
        export MARIADB_USER="$DB_USER"
        export MARIADB_PASSWORD="$DB_PASS"
        export MARIADB_DATABASE="$DB_NAME"
        export MARIADB_URL="$DATABASE_URL"
        # Also set MySQL vars for compatibility
        export MYSQL_HOST="$DB_HOST"
        export MYSQL_PORT="$DB_PORT"
        export MYSQL_USER="$DB_USER"
        export MYSQL_PASSWORD="$DB_PASS"
        export MYSQL_DATABASE="$DB_NAME"
        export MYSQL_URL="$DATABASE_URL"
        echo "Set MariaDB-specific environment variables"
        ;;
      "redis")
        export REDIS_HOST="$DB_HOST"
        export REDIS_PORT="$DB_PORT"
        export REDIS_URL="$DATABASE_URL"
        # Also set Valkey vars since OSC uses Valkey
        export VALKEY_URL="$DATABASE_URL"
        echo "Set Redis-specific environment variables"
        ;;
      "mongodb")
        export MONGO_URL="$DATABASE_URL"
        export MONGODB_URI="$DATABASE_URL"
        # Also set CouchDB vars since OSC uses CouchDB for document storage
        export COUCHDB_URL="$DATABASE_URL"
        echo "Set MongoDB-specific environment variables"
        ;;
      *)
        echo "Unknown database scheme: $DB_SCHEME, using generic variables only"
        ;;
    esac
  else
    echo "Warning: Could not parse DATABASE_URL format"
  fi
else
  echo "No DATABASE_URL provided, skipping database variable setup"
fi

# Execute the original command
exec "$@"
