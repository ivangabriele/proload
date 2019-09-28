const fs = require("fs");
const makeDir = require("make-dir");
const numeral = require("numeral");
const ora = require("ora");
const path = require("path");
const request = require("request");
const rorre = require("rorre");

const SAFE_RESOLVE_TIMEOUT = 2000;

const E = rorre.declare({
  PRM_DFP_NOT_STRING: "<destFilePath> must be a string or left undefined to get a data buffer.",
  PRM_SPR_NOT_STRING: "<spinner> must be an instance or Ora.",
  PRM_URI_NOT_STRING: "<uri> is mandatory and must be a string."
});

function createRequest(uri, config, resolve, reject) {
  const { request: requestOptions, spinner } = config;

  // eslint-disable-next-line no-underscore-dangle
  const _spinner = spinner !== undefined ? spinner : {};
  if (_spinner.instance === undefined) {
    _spinner.instance = ora();
  }

  const { instance: spinnerInstance, progressPrefix, progressSuffix, successMessage } = _spinner;

  const dataChunks = [];
  let currentLength = 0;
  let totalLength = 0;

  return request(uri, requestOptions)
    .on("error", reject)
    .on("response", res => {
      if (!Number.isNaN(res.headers["content-length"])) {
        const contentLength = Number(res.headers["content-length"]);
        if (contentLength > 0) {
          totalLength = contentLength;
          spinnerInstance.start(`${progressPrefix || ""}  0%${progressSuffix || ""}`);

          return;
        }
      }

      spinner.start("???%");
    })
    .on("data", chunk => {
      dataChunks.push(chunk);

      currentLength += chunk.length;

      if (totalLength !== 0) {
        const percentage = numeral(currentLength / totalLength).format("0%");
        const text = `${progressPrefix || ""}${percentage.padStart(4, " ")}${progressSuffix || ""}`;

        spinnerInstance.text = text;
      }
    })
    .on("end", () => {
      spinnerInstance.succeed(successMessage || "100%");

      if (spinner === undefined || spinner.instance === undefined) {
        spinnerInstance.stop();
      }

      setTimeout(() => {
        const dataBuffer = Buffer.concat(dataChunks);

        resolve(dataBuffer);
      }, SAFE_RESOLVE_TIMEOUT);
    });
}

function proload(uri, destFilePathOrOptions, options) {
  try {
    if (typeof uri !== "string") {
      return Promise.reject(E.PRM_URI_NOT_STRING);
    }

    let config;
    if (options !== undefined) {
      config = options;

      if (destFilePathOrOptions !== undefined && typeof destFilePathOrOptions !== "string") {
        return Promise.reject(E.PRM_DFP_NOT_STRING);
      }
    } else if (destFilePathOrOptions !== undefined) {
      if (destFilePathOrOptions.constructor.name === "Object") {
        config = destFilePathOrOptions;
      } else if (typeof destFilePathOrOptions !== "string") {
        return Promise.reject(E.PRM_DFP_NOT_STRING);
      } else {
        config = {};
      }
    } else {
      config = {};
    }

    if (
      config.spinner !== undefined &&
      config.spinner.instance !== undefined &&
      config.spinner.instance.constructor.name !== "Ora"
    ) {
      return Promise.reject(E.PRM_SPR_NOT_STRING);
    }

    return new Promise((resolve, reject) => {
      if (typeof destFilePathOrOptions === "string") {
        const destFilePath = destFilePathOrOptions.replace(path.sep, "/");
        if (/\//.test(destFilePath)) {
          const destFilePaths = destFilePath.split("/");
          const destDirPath = destFilePaths.slice(0, destFilePaths.length - 1).join("/");

          if (!fs.existsSync(destDirPath)) {
            makeDir.sync(destDirPath);
          }
        }

        createRequest(uri, config, resolve, reject).pipe(
          fs.createWriteStream(destFilePathOrOptions)
        );

        return;
      }

      createRequest(uri, config, resolve, reject);
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

module.exports = proload;

// Allow use of default import syntax in TypeScript:
module.exports.default = proload;
