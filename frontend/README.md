# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Internationalization (i18n)

This app uses [`react-i18next`](https://react.i18next.com/) for internationalization. All user-visible strings are externalized into locale JSON files.

### Locale files

```
frontend/src/i18n/
├── index.ts                  # i18next initialization
└── locales/
    ├── en.json               # English resource bundle (default + fallback)
    └── es.json               # Spanish resource bundle (1:1 key parity with en.json)
```

Key naming follows dot notation grouped by feature: `feature.subSection.element`
(e.g. `dashboard.title`, `candidates.form.firstName`, `status.open`).

### Setting the locale

The active locale is set at build/startup time via the environment variable:

```
REACT_APP_DEFAULT_LOCALE=en   # English (default when variable is absent)
REACT_APP_DEFAULT_LOCALE=es   # Spanish
```

Add this to your `.env` file (see `.env.example`) and restart the dev server.
The fallback locale is always `en`.

### Adding new strings

1. Add the key and English value to `src/i18n/locales/en.json`.
2. Add the matching key and Spanish translation to `src/i18n/locales/es.json`.
3. Use `const { t } = useTranslation()` in your component and call `t('your.key')`.
4. Run `npm test` — the parity test in `src/i18n/__tests__/locales.test.ts` will fail if the two JSON files diverge.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
