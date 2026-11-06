-- USA Travel Map: database schema (PostgreSQL 14+)
--
-- Reference data (loaded once from the seed files):
--   states          50 states + DC
--   cities          ~16,500 US cities and towns
--
-- User data:
--   users           accounts
--   visited_regions states and countries a user has marked
--   visited_cities  cities a user has marked
--   map_settings    theme and label preference, one row per user
--   shared_maps     public share link, one per user

CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL    PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,          -- always stored lower-case
    password_hash VARCHAR(100) NOT NULL,                 -- BCrypt, never the raw password
    display_name  VARCHAR(60)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS states (
    code VARCHAR(2)  PRIMARY KEY,                        -- postal code, e.g. 'MI'
    fips VARCHAR(2)  NOT NULL UNIQUE,                    -- Census code, e.g. '26' (matches the map file)
    name VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS cities (
    id         BIGINT           PRIMARY KEY,             -- GeoNames id
    name       VARCHAR(120)     NOT NULL,
    state_code VARCHAR(2)       NOT NULL REFERENCES states (code),
    lat        DOUBLE PRECISION NOT NULL,
    lon        DOUBLE PRECISION NOT NULL,
    population INTEGER          NOT NULL
);

-- "Cities in Michigan, biggest first"
CREATE INDEX IF NOT EXISTS cities_state_population_idx ON cities (state_code, population DESC);
-- Autocomplete: WHERE upper(name) LIKE 'DETR%'
CREATE INDEX IF NOT EXISTS cities_name_prefix_idx ON cities (upper(name) varchar_pattern_ops);

CREATE TABLE IF NOT EXISTS visited_regions (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    region_type VARCHAR(10) NOT NULL CHECK (region_type IN ('STATE', 'COUNTRY')),
    region_code VARCHAR(40) NOT NULL,                    -- 'MI' for a state, ISO numeric '840' for a country
    visited_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, region_type, region_code)
);

CREATE TABLE IF NOT EXISTS visited_cities (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    city_id    BIGINT      NOT NULL REFERENCES cities (id),
    visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, city_id)
);

CREATE TABLE IF NOT EXISTS map_settings (
    user_id     BIGINT      PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    theme       VARCHAR(20) NOT NULL DEFAULT 'interstate',
    show_labels BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS shared_maps (
    slug       VARCHAR(12) PRIMARY KEY,                  -- the random part of /share/{slug}
    user_id    BIGINT      NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
