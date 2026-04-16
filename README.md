# amhrest
A full-stack platform for university-verified off-campus housing, connecting students with landlords. A link to our specification document can be found [here](https://docs.google.com/document/d/1NZeL1vhauEurR9mQQ8y43ZGX045EWZTWInTkXZE8nCE/edit?usp=sharing).

## Setup
Follow the instructions [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install `node` and `npm`. Also ensure you have `git` installed; instructions are available [here](https://git-scm.com/install/).

Once that's done, you can run:

```sh
git clone https://github.com/akoduru727/CS320-Spring2026-S3-Team1 amhrest
```

to clone our project into a folder named `amhrest`.

Run `cd amhrest` to enter the folder, then `npm install` to install our dependencies.

## Developing

Once setup is complete, you can start a development server with:

```sh
npm run dev
```

From there, visit `localhost:5173` in your web browser to see the app.

## Building

To create a production build, run:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## E2E Tests

Run a single test file (no auth):

```sh
npx e2e authGateTests
```

Run a single test file with auth + role:

```sh
npx e2e bypassTest tenant
npx e2e bypassTest landlord
```

Run all `.e2e.ts` tests in `tests/` (auto-detects tenant/landlord by filename):

```sh
npx e2e all
```

- `npx e2e all` takes a while to run because it runs every test file sequentially.
- If the filename includes `tenant` or `landlord`, the runner sets `auth=true` and `acc_type` automatically.
- Otherwise, it runs with `auth=false`.
