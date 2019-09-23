# proload

[![License][img-license]][link-license]
[![NPM Version][img-npm]][link-npm]
[![Build Status][img-travis]][link-travis]
[![Code Coverage][img-coveralls]][link-coveralls]

File & Buffer downloader with a progress bar, compatible with [ora][link-ora].

## Install

```bash
npm i -D proload
```

## Examples

### Download to Buffer

```js
import proload from "proload";

(async () => {
  const dataBuffer = await proload("https://www.gutenberg.org/files/308/308-h.zip");

  console.log(dataBuffer.toString());
})();
```

### Download to File

```js
import proload from "proload";

(async () => {
  await proload("https://www.gutenberg.org/files/308/308-h.zip", "./Three Men in a Boat.zip");
})();
```

### Existing Ora Spinner

```js
import ora from "ora";
import proload from "proload";

const spinner = ora();

(async () => {
  const uri = "https://www.gutenberg.org/files/308/308-h.zip";
  const options = {
    spinner: {
      instance: spinner
    }
  };

  const dataBuffer = await proload(uri, options);
  // Or:
  await proload(uri, "./Three Men in a Boat.zip", options);

  // Don't forget that the spinner is on your side, so you will have to stop it yourself
  // or do something else with it:
  spinner.stop();
})();
```

## Options

```ts
{
  request: request.CoreOptions; // @see https://github.com/request/request#requestoptions-callback
  spinner: {
    instance: ora.Ora;
    progressPrefix: string; // Prefix message while downloading (before the `XXX%`)
    progressSuffix: string; // Suffix message while downloading (after the `XXX%`)
    successMessage: string; // Success message once the download has ended
  }
}
```

## Contribute

### Get Started

```bash
yarn
```

### Test

- Lint Tests: `yarn test:lint`
- Unit Tests: `yarn test:unit`
- Unit Tests (watch): `yarn test:watch`

### Generate Data

```bash
yarn data:generate [fr|en]...
```

---

[img-coveralls]: https://img.shields.io/coveralls/github/ivangabriele/proload/master?style=flat-square
[img-license]: https://img.shields.io/badge/License-MIT-blue?style=flat-square
[img-npm]: https://img.shields.io/npm/v/proload?style=flat-square
[img-travis]: https://img.shields.io/travis/com/ivangabriele/proload/master?style=flat-square
[link-coveralls]: https://coveralls.io/github/ivangabriele/proload
[link-license]: https://github.com/ivangabriele/proload/blob/master/LICENSE
[link-ora]: https://github.com/sindresorhus/ora
[link-npm]: https://www.npmjs.com/package/proload
[link-travis]: https://travis-ci.com/ivangabriele/proload
