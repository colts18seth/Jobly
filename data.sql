CREATE TABLE companies
(
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

CREATE TABLE jobs
(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    salary DECIMAL NOT NULL,
    equity DECIMAL NOT NULL,
    CHECK (equity < 1 AND equity >= 0),
    company_handle TEXT REFERENCES companies (handle) ON DELETE CASCADE,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users
(
    username TEXT PRIMARY KEY,
    password VARCHAR NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    photo_url TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);