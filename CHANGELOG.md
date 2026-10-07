# Changelog

## 0.1.0 (2026-10-07)


### Features

* "Mis planes" page with saved trips and group plans ([649ba0d](https://github.com/Kevin-Curruchich/map-my-trip/commit/649ba0dd11d5862c3b97462b05a5ff2af41f4000))
* AI plan proposals, group voting and closing by the creator ([3e9ef4d](https://github.com/Kevin-Curruchich/map-my-trip/commit/3e9ef4df932deee527b6adf2902b17f2243c4a75))
* **events:** add shared-link group events backed by Postgres ([6b5d087](https://github.com/Kevin-Curruchich/map-my-trip/commit/6b5d08739119193456266e911f6702227569b71f))
* **events:** ground proposals in real places and add a curated places base ([4d1db33](https://github.com/Kevin-Curruchich/map-my-trip/commit/4d1db33f48b4570cf6accb8f7b05a2ad836b2a75))
* **events:** pick the event's place and date instead of free text ([b6c1b8e](https://github.com/Kevin-Curruchich/map-my-trip/commit/b6c1b8e2eb6ba797bc5cab9e790ec83f3abe250f))
* **events:** rich WhatsApp link previews and reliable share button ([f6d771f](https://github.com/Kevin-Curruchich/map-my-trip/commit/f6d771fec7945aa4868e861d77888730c7677d11))


### Bug Fixes

* **admin:** use an English route for the places admin ([aab2f5e](https://github.com/Kevin-Curruchich/map-my-trip/commit/aab2f5e9c799a8d0038842ba8ae3ffed4f820ce5))
* **deploy:** resolve environment variables inside the deploy job ([b7b89fe](https://github.com/Kevin-Curruchich/map-my-trip/commit/b7b89febbdad602cbf06b5c6bd12803638c38fbf))
* **events:** keep the app's tables in the map_my_trip_db schema ([a4cebf9](https://github.com/Kevin-Curruchich/map-my-trip/commit/a4cebf9865bcdf930820f8a624f9ce1b030289c5))
* store saved trips in saved_trips to avoid an existing trips table ([b1c1c9d](https://github.com/Kevin-Curruchich/map-my-trip/commit/b1c1c9df38f7f7a1afeba6fdd89121d24b13fe97))
* trip generation 400 from OpenAI strict structured output ([3f8cadf](https://github.com/Kevin-Curruchich/map-my-trip/commit/3f8cadf9336f966d0f1083a1cc279545fe1b7e15))


### Refactoring

* fix broken patterns across auth, base and trips layers ([289b3a9](https://github.com/Kevin-Curruchich/map-my-trip/commit/289b3a97de81a004f936d578346f85ee01e48345))


### Build & Deploy

* deploy to Google Cloud Run instead of AWS Amplify ([6d04cd1](https://github.com/Kevin-Curruchich/map-my-trip/commit/6d04cd1d416b92551665402dfa9fa3667d1be29c))
