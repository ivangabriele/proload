# proload

[![License][img-license]][link-license]
[![NPM Version][img-npm]][link-npm]
[![Build Status][img-travis]][link-travis]
[![Code Coverage][img-coveralls]][link-coveralls]

File & Buffer URI downloader with a progress bar, compatible with [ora][link-ora].

## TOC

1. [Install](#install)
1. [Features](#features)
1. [API](#api)
   1. [Options](#options)
1. [Examples](#examples)
   1. [Download to Buffer](#download-to-buffer)
   1. [Download to File](#download-to-file)
   1. [Existing Ora Spinner](#existing-ora-spinner)
1. [Known Issues](#known-issues)
1. [Contribute](#contribute)

## Install

```bash
npm i -D proload
```

### Features

- Ora optional integration (= ability to attach an existing ora instance).
- Automatically creates the destination directory if it does not exist.
- Can return a buffer of the data instead of creating a new file.

## API

```ts
proload(uri: string, options?: Object): Promise<Buffer>
proload(uri: string, destFilePath: string, options?: Object): Promise<Buffer>
```

### Options

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

## Known Issues

**If you want to use [rimraf][link-rimraf] or [make-dir][link-make-dir] before calling `proload()`**
in your code, you will have to use the `.sync()` method instead of the `await` mode. I don't know
yet why this issue happens and will try my best to find a fix.

## Contribute

### Get Started

```bash
npm i
```

### Test

- All Tests: `npm test`
- Lint Tests: `npm run test:lint`
- Unit Tests: `npm run test:unit`
- Unit Tests (watch): `npm run test:watch`

---

[img-coveralls]: https://img.shields.io/coveralls/github/ivangabriele/proload/master?style=flat-square
[img-license]: https://img.shields.io/badge/License-MIT-blue?style=flat-square
[img-npm]: https://img.shields.io/npm/v/proload?style=flat-square
[img-travis]: https://img.shields.io/travis/com/ivangabriele/proload/master?style=flat-square
[link-coveralls]: https://coveralls.io/github/ivangabriele/proload
[link-license]: https://github.com/ivangabriele/proload/blob/master/LICENSE
[link-ora]: https://github.com/sindresorhus/ora
[link-npm]: https://www.npmjs.com/package/proload
[link-rimraf]: https://github.com/isaacs/rimraf
[link-make-dir]: https://github.com/sindresorhus/make-dir
[link-travis]: https://travis-ci.com/ivangabriele/proload
