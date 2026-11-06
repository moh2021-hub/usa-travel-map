# REST API reference

Base URL in development: `http://localhost:8080`

Every request and response body is JSON. Endpoints marked **Login** need this header,
using the `token` returned by register or login:

```
Authorization: Bearer <token>
```

Errors always look like this, with a matching HTTP status:

```json
{ "status": 404, "message": "No state with code ZZ" }
```

A missing, expired or invalid token returns `401` with an empty body.

## Summary

| Method | Path | Login | What it does |
|---|---|---|---|
| POST | `/api/auth/register` | | Create an account, returns a token |
| POST | `/api/auth/login` | | Log in, returns a token |
| GET | `/api/me` | Login | The logged-in user |
| GET | `/api/states` | | All 50 states plus DC |
| GET | `/api/states/{code}/cities` | | Cities in one state, biggest first |
| GET | `/api/cities/search` | | Autocomplete by city name |
| GET | `/api/cities/nearest` | | The city closest to a latitude and longitude |
| GET | `/api/me/visits` | Login | Everything the user has marked |
| POST | `/api/me/visits/merge` | Login | Add places picked while logged out |
| PUT / DELETE | `/api/me/visits/states/{code}` | Login | Mark or unmark a state |
| PUT / DELETE | `/api/me/visits/countries/{code}` | Login | Mark or unmark a country |
| PUT / DELETE | `/api/me/visits/cities/{id}` | Login | Mark or unmark a city |
| GET | `/api/me/settings` | Login | Theme and label preference |
| PUT | `/api/me/settings` | Login | Save theme and label preference |
| POST | `/api/share` | Login | Get the user's public share link |
| GET | `/api/share/{slug}` | | View a shared map |

## Accounts

### POST /api/auth/register

```json
{ "email": "sam@example.com", "password": "at-least-8-chars", "displayName": "Sam" }
```

`201 Created`

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { "id": 1, "email": "sam@example.com", "displayName": "Sam" }
}
```

- `400` if a field is missing, the email is not valid, or the password is not 8 to 72 characters
- `409` if the email already has an account

### POST /api/auth/login

```json
{ "email": "sam@example.com", "password": "at-least-8-chars" }
```

`200 OK` with the same body as register. `401` if the email or password is wrong.

### GET /api/me (Login)

```json
{ "id": 1, "email": "sam@example.com", "displayName": "Sam" }
```

## States and cities

### GET /api/states

```json
[
  { "code": "AL", "fips": "01", "name": "Alabama" },
  { "code": "AK", "fips": "02", "name": "Alaska" }
]
```

`code` is the postal abbreviation used everywhere in this API. `fips` is the id of the
state's shape in the map file.

### GET /api/states/{code}/cities

| Query parameter | Default | Meaning |
|---|---|---|
| `minPopulation` | `0` | Only cities with at least this many residents |

`GET /api/states/MI/cities?minPopulation=100000`

```json
[
  { "id": 4990729, "name": "Detroit", "stateCode": "MI", "lat": 42.33143, "lon": -83.04575, "population": 677116 }
]
```

`404` if the state code is unknown.

### GET /api/cities/search

| Query parameter | Default | Meaning |
|---|---|---|
| `q` | required | The first letters of the city name |
| `state` | all states | Limit the search to one state code |
| `limit` | `10` | Number of results, 25 at most |

`GET /api/cities/search?q=detr&state=MI` returns a list of cities in the same shape as above.
An empty `q` returns an empty list.

### GET /api/cities/nearest

`GET /api/cities/nearest?lat=42.58&lon=-82.95` returns one city. Used with the browser's
location to answer "which city am I in?". `400` if `lat` or `lon` is out of range.

## Visited places (Login)

### GET /api/me/visits

```json
{
  "states": ["CA", "MI"],
  "countries": ["124", "840"],
  "cities": [
    { "id": 4990729, "name": "Detroit", "stateCode": "MI", "lat": 42.33143, "lon": -83.04575, "population": 677116 }
  ]
}
```

- State codes are postal abbreviations.
- Country codes are the ids from the world map file: ISO 3166-1 numeric codes such as `840`
  (United States), or `x-kosovo` style codes for the few places that have none.

### PUT and DELETE on one place

| Path | Notes |
|---|---|
| `/api/me/visits/states/{code}` | `404` on PUT if the state code is unknown |
| `/api/me/visits/countries/{code}` | `400` on PUT if the code has characters other than letters, numbers and dashes |
| `/api/me/visits/cities/{id}` | PUT also marks the city's state. `404` on PUT if the city id is unknown |

All return `204 No Content`. Repeating a request is harmless: marking twice marks once,
and unmarking something that is not marked does nothing.

### POST /api/me/visits/merge

Sent once after login so that places picked while logged out are kept. It only adds, never
removes, and skips anything it does not recognise. Any of the three lists may be left out.

```json
{ "states": ["MI", "OH"], "countries": ["840"], "cityIds": [4990729] }
```

`200 OK` with the full combined list, in the same shape as `GET /api/me/visits`.

## Settings (Login)

### GET /api/me/settings and PUT /api/me/settings

```json
{ "theme": "interstate", "showLabels": true }
```

`theme` is a short lower-case name chosen by the frontend (`interstate`, `canyon`, `lake`,
`dusk`, `night`). PUT returns what was saved.

## Sharing

### POST /api/share (Login)

```json
{ "slug": "k7m2xq9hnd" }
```

Each user has one link, and it always shows their map as it is now. The frontend turns the
slug into `/share/k7m2xq9hnd`.

### GET /api/share/{slug}

```json
{
  "displayName": "Sam",
  "theme": "interstate",
  "showLabels": true,
  "states": ["CA", "MI"],
  "countries": ["840"],
  "cities": [
    { "id": 4990729, "name": "Detroit", "stateCode": "MI", "lat": 42.33143, "lon": -83.04575, "population": 677116 }
  ]
}
```

`404` if the link does not exist. The owner's email address is never included.
