# USA Travel Map

Mark the US states, cities and countries you've visited, pick a color theme, and download
or share your map. React frontend, Spring Boot REST API, PostgreSQL database.

## What's in each folder

| Folder | What it is | Start here |
|---|---|---|
| `frontend/` | The React app (Vite, TypeScript, Tailwind) | `src/App.tsx` |
| `backend/` | The Spring Boot REST API (Java 21, Maven) | `src/main/java/com/example/travelmap/` |
| `database/` | The PostgreSQL tables and starting data | `init/01_schema.sql` |
| `api/` | The REST API written down: every endpoint with examples | `API.md` |

```
usa-travel-map/
├── database/
│   ├── docker-compose.yml        starts PostgreSQL and loads the files below
│   ├── init/
│   │   ├── 01_schema.sql         the 7 tables
│   │   ├── 02_seed_states.sql    50 states + DC
│   │   └── 03_seed_cities.sql    16,484 US cities and towns
│   └── tools/                    script that regenerates the two seed files
├── backend/
│   ├── pom.xml                   dependencies
│   └── src/main/
│       ├── resources/application.yml   database address, JWT secret, CORS
│       └── java/com/example/travelmap/
│           ├── controller/       the URLs (one method per endpoint)
│           ├── service/          the rules (what marking a city means, who can log in)
│           ├── repository/       the database queries
│           ├── entity/           one class per table
│           ├── dto/              the JSON shapes sent and received
│           ├── config/           login security, tokens, CORS
│           └── exception/        turns errors into {"status", "message"} JSON
├── api/
│   ├── API.md                    endpoint reference
│   └── requests.http             ready-made requests to click and send
└── frontend/
    └── src/
        ├── pages/                UsPage, StatePage, WorldPage, SharePage
        ├── components/           the maps, the totals sign, theme picker, login, downloads
        ├── lib/                  map data, themes, image export, saving to the account
        ├── store/                what's been marked (kept in the browser) and who is logged in
        ├── hooks/                zoom and pan
        └── api/                  the one function that calls the backend
```

How a click travels through the layers, using "mark Detroit as visited" as the example:

1. `frontend/src/components/StateMap.tsx` - the dot is clicked.
2. `frontend/src/lib/sync.ts` - the map updates at once, then `PUT /api/me/visits/cities/4990729` is sent.
3. `backend/.../controller/VisitController.java` - receives the request and reads the user from the token.
4. `backend/.../service/VisitService.java` - checks the city exists, marks it, and marks Michigan too.
5. `backend/.../repository/VisitedCityRepository.java` - runs the `INSERT`.
6. `database/init/01_schema.sql` - the `visited_cities` table the row lands in.

## Run it on your computer

You need [Docker](https://www.docker.com/products/docker-desktop/), Java 21,
[Maven](https://maven.apache.org/install.html) 3.9 or newer, and Node.js 22 or newer.
Use three terminals, in this order.

**1. Database**

```
cd database
docker compose up -d
```

The first start creates the tables and loads the states and cities. It listens on port 5432.

No Docker? Install PostgreSQL, create a database and user both named `travelmap`
(password `travelmap`), then run the three files in `database/init` in order with
`psql -U travelmap -d travelmap -f init/01_schema.sql` and so on.

**2. Backend**

```
cd backend
mvn spring-boot:run
```

The API is ready at http://localhost:8080 when you see `Started TravelMapApplication`.
Try http://localhost:8080/api/states in a browser. You can also open the `backend` folder in
IntelliJ IDEA and run `TravelMapApplication`, which doesn't need Maven installed separately.

**3. Frontend**

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

The state and world maps work with only the frontend running, and everything you mark is
kept in the browser. City dots, city search, "find the city I'm in", accounts and share
links need the backend and database.

## What's built

- US map: click a state or tick it in the list; totals update as you go
- State pages: every city with 1,000+ people as a dot, with search, zoom and a size filter
- World map: 240 countries and territories
- Five color themes, optional state labels
- Download as PNG, JPG or PDF
- "Find the city I'm in" using the browser's location
- Accounts (email and password): your map follows you between devices, and places marked
  before logging in are added to the account
- A public share link per account

Not built yet, from the original site: the travel guide, quiz, trip planner, user-submitted
places with moderation, and a second language.

## How far this has been tested

- **Database:** the three SQL files were run against PostgreSQL 16, twice, to confirm they load
  cleanly and are safe to re-run.
- **Frontend:** type-checked, built, and driven end to end in a real browser (marking states,
  cities and countries, downloads in all three formats, register, login, logout, share link,
  phone-sized screen) against a small stand-in server that follows `api/API.md` and uses the
  same SQL as the backend.
- **Backend:** NOT compiled or run. The environment this was written in could not download
  Spring Boot from Maven Central. Every Java file passes a syntax check and the classes are
  consistent with each other, but the first `mvn spring-boot:run` on your machine is the first
  real run. If it reports an error, the message will name the file and line.

`backend/pom.xml` uses Spring Boot 4.1.1. If Maven says that version can't be found, change
the `<version>` near the top of `pom.xml` to the latest 4.x listed at
https://spring.io/projects/spring-boot.

## Before putting it online

- Set `JWT_SECRET` to your own random string of 32+ characters. The value in
  `application.yml` is for development only, and anyone who knows it can log in as anyone.
- Set `DB_URL`, `DB_USER`, `DB_PASSWORD` for your hosted database, and `CORS_ORIGINS` to the
  address of your frontend.
- Build the frontend with `VITE_API_URL` set to the address of your backend (see
  `frontend/.env.example`), and configure your host to serve `index.html` for every path so
  links like `/state/MI` and `/share/abc` work when opened directly.
- Keep the GeoNames credit in the footer. Their data is free to use under CC BY 4.0, which
  requires attribution.

## Data sources

- State shapes: US Census Bureau, via the `us-atlas` npm package
- Country shapes: Natural Earth (public domain), via the `world-atlas` npm package
- Cities: [GeoNames](https://www.geonames.org/) (CC BY 4.0), via the `all-the-cities` npm package
