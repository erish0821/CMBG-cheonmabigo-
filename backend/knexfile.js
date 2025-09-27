require('dotenv').config();

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/seeds',
    },
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME_TEST || 'cheonmabigo_test',
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      directory: './src/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/seeds',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 5,
      max: 20,
    },
    migrations: {
      directory: './src/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/seeds',
    },
    acquireConnectionTimeout: 60000,
    timeout: 30000,
  },
};

module.exports = config;