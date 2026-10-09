# Changelog

## [0.3.1](https://github.com/Kevin-Curruchich/map-my-trip/compare/v0.3.0...v0.3.1) (2026-10-09)


### Bug Fixes

* keep place searches in Guatemala and near the event or destination ([4e23a62](https://github.com/Kevin-Curruchich/map-my-trip/commit/4e23a62a8ce375b07bcf75e2c7872ab236fff600))

## [0.3.0](https://github.com/Kevin-Curruchich/map-my-trip/compare/v0.2.0...v0.3.0) (2026-10-09)


### Features

* **events:** the plan's owner is always its Google account ([5bb79f8](https://github.com/Kevin-Curruchich/map-my-trip/commit/5bb79f8e2906f685ed307f8f136fde70bb34365d))


### Bug Fixes

* **auth:** keep return paths with encoded spaces and reject control characters ([4c83ee3](https://github.com/Kevin-Curruchich/map-my-trip/commit/4c83ee3c275acd9690c4fb3d25cc17135af48360))
* **base:** return to the current page after signing in from the header ([4673820](https://github.com/Kevin-Curruchich/map-my-trip/commit/4673820c5f421884d58db6322477831570113455))
* **events:** explain when a plan belongs to another Google account ([af8428b](https://github.com/Kevin-Curruchich/map-my-trip/commit/af8428b103e962f8a2d1051d857518d206d892b8))
* plan owner is always its Google account, plus login follow-ups ([2c5af5f](https://github.com/Kevin-Curruchich/map-my-trip/commit/2c5af5f1ede89bdd33a6da1571ed15292f33ca20))

## [0.2.0](https://github.com/Kevin-Curruchich/map-my-trip/compare/v0.1.0...v0.2.0) (2026-10-09)


### Features

* **auth:** return to the original page after Google sign-in ([08a5109](https://github.com/Kevin-Curruchich/map-my-trip/commit/08a510970d0162daa1c3b6b97ade4a17601d754f))
* **base:** add MapMyTrip logo, favicon and app icons ([cd542be](https://github.com/Kevin-Curruchich/map-my-trip/commit/cd542bed5bf11f9235bfb8c7e3735ea99d0d7ddc))
* **base:** brand theme with mango and green palette and Manrope ([f1b491a](https://github.com/Kevin-Curruchich/map-my-trip/commit/f1b491a0f0572787f5bf4a5d96f6776e37d74f6a))
* **base:** smiling logo mark for better contrast ([b54a53e](https://github.com/Kevin-Curruchich/map-my-trip/commit/b54a53e80c5b957b3249ca51eb549a59a8ab647a))
* **base:** Spanish header with new logo and landing anchors ([c22fbd5](https://github.com/Kevin-Curruchich/map-my-trip/commit/c22fbd52fb85e78e5c6392e5f2646d77a9977d0b))
* **events:** ask the creator to sign in before using the AI ([42a2447](https://github.com/Kevin-Curruchich/map-my-trip/commit/42a24477c80397ad70a9bd084f3a2e6aacf7c371))
* **events:** rebrand the WhatsApp link preview ([672c95c](https://github.com/Kevin-Curruchich/map-my-trip/commit/672c95c6ff91a0cbf16aaf69aed66552e9b25949))
* **events:** require sign-in to generate AI proposals and claim the plan ([c134a5f](https://github.com/Kevin-Curruchich/map-my-trip/commit/c134a5f48513177a581bb25683b4063a5429a51a))
* **marketing:** full Spanish landing with features, trips, FAQ and share image ([ce18a34](https://github.com/Kevin-Curruchich/map-my-trip/commit/ce18a34aa18bc4c62be8437f684f651aaaad6ee9))
* **marketing:** group-plan hero with a voting demo ([9b82fac](https://github.com/Kevin-Curruchich/map-my-trip/commit/9b82fac2c8c6b06fb68a99c05d7234b98b8c4059))


### Bug Fixes

* **base:** readable contrast for brand-colored text across the app ([36ef168](https://github.com/Kevin-Curruchich/map-my-trip/commit/36ef168d13b1d1852f1f1aad3a5c5a302177bcfe))
* **events:** stop a second account from claiming a plan at the same time ([3104d26](https://github.com/Kevin-Curruchich/map-my-trip/commit/3104d26a970039c773335b7ffdec29ada27960f7))

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
