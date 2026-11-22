# Joc de Cartes Finder - Roadmap

## Milestone 1: Mass verified ingestion
- Target: 100+ verified restaurant spots across seasons 1-10.
- Sources: 3Cat episodes and regional press, verified before ingestion.
- Record verified participants and winners in public/data/restaurants.json.

## Milestone 2: UI and discovery enhancements
- Interactive map (Leaflet or MapLibre).
- Filters by price, winner status, and Marc Ribas badge.
- Search and filter by comarca and season.
- Score sorting.
- Favorites / bookmarks saved locally.

## Milestone 3: PWA and offline resilience
- PNG app icons at 192x192 and 512x512.
- Offline caching of the dataset and static assets.

## Milestone 4: Community and feedback
- User feedback submission.
- Reporting of incorrect or closed venues.

## Milestone 5: Technological value-add features

### 5.1 Ruta Joc de Cartes (geo day-trip planner)
- Geo-based day-trip planner that builds a route through selected program restaurants.
- Distance between spots computed with the Haversine formula.
- Stop ordering solved as a Travelling Salesman Problem (TSP) using a nearest-neighbour heuristic refined with 2-opt.
- User picks a start point, a day length, and optional filters (comarca, price, winner status).
- Output: ordered stops, total distance, estimated driving time, and a shareable link or export.

### 5.2 Modo "Tu Joc de Cartes" (interactive offline scoring)
- Offline-first PWA mode where the user scores a visited restaurant.
- Criteria: food, service, space, kitchen, and price.
- Users can name their star dish (plato estrella).
- Side-by-side comparison of the user's score with the Marc Ribas score for the same venue.
- Results stored locally; works without a network connection.
- Export the result as a shareable card image for social networks.

### 5.3 "El Veredicte de Marc Ribas" (client-side semantic search)
- Semantic search over the program's reviews and verdict texts, run entirely in the browser.
- Keyword and fuzzy matching via MiniSearch.
- Lightweight local vector representation for meaning-based matching, with no backend required.
- Index built at build time and cached for offline use.

### 5.4 Radar "Tens a prop" (passive geofencing)
- Opt-in passive geofencing in the PWA that detects when the user is near a restaurant from the program.
- Uses the browser Geolocation API while the app is open or installed, with explicit user consent.
- Sends a local notification when the user passes within a set radius of a program restaurant.
- Users can disable the radar or adjust the radius at any time; no location data leaves the device.
