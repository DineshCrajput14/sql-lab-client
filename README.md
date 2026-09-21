# PMS Frontend

Property Management System (PMS) web client built with Angular 15, AG Grid, and Tabler UI.

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## For First Time Users (VERSION error)

Run `npm run app-version` (or `npm run build`) to generate the version file, then run `npm run start`.

## Npm Scripts

`package.json` has following scripts:

### npm run start

This command starts the project on local dev server.

### npm run build

This command builds the project.

### npm run lint

This command checks the format issues in the code using Prettier.

### npm run prettier

This command formats the code using Prettier.

### npm run app-version

This command updates the version in `scripts/version.js`.

### npm run release

This command creates a release and updates versioning.

### npm run test:unit

This command runs unit tests with Jest.

### npm run test:unit:coverage

This command runs unit tests and generates code coverage reports.

### npm run test:unit:watch

This command runs unit tests in watch mode for local development.

### npm run test:e2e

This command runs Playwright end-to-end tests in headless mode.

### npm run test:e2e:headed

This command runs Playwright end-to-end tests in headed mode.

## Testing Flow

### Before Creating a Pull Request

Run following commands on your local machine:

1. Check/fix formatting issues by running `npm run prettier`
2. Check linting: `npm run lint`
3. Run unit tests by running `npm run test:unit` or `npm run test:unit:watch`
4. Verify build succeeds: `npm run build`

## Further help

To get more help on the Angular CLI use `ng help` or check out the [Angular CLI Documentation](https://angular.io/cli).
