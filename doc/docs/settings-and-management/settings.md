---
sidebar_position: 2
---

# Settings

We use **environment variables** to configure the application and load them from a `.env` file.

## Generate Default Settings and Customize

In the current directory execute the following command to generate an `.env` file.

```sh
owl app generate-env > .env
```

Open the `.env` file you just generated and see the variables.


```sh title=".env"
# The secret key for Flask sessions and JWT
SECRET_KEY=xxx

# Whether Flask is in debug mode
# FLASK_DEBUG=False

# The Google client ID
# GOOGLE_CLIENT_ID=

# The Google client secret
# GOOGLE_CLIENT_SECRET=

# Is Google Login enabled.
# GOOGLE_OAUTH_ENABLED=False

# The URI for the database. Only Postgres and SQLite supported.
SQLALCHEMY_DATABASE_URI="sqlite:///sqlite.db"

# Whether the app is in production mode
# PRODUCTION=False

# The public URL of the app
# PUBLIC_URL=

# Whether to log to stdout
# LOG_STDOUT=False

# The format of the logs
LOG_FORMAT="%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# The level of the logs
LOG_LEVEL="INFO"

# Base path to store files
STORAGE_BASE_PATH=storage
```
