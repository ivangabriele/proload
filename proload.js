const fs = require("fs");
const makeDir = require("make-dir");
const numeral = require("numeral");
const ora = require("ora");
const path = require("path");
const request = require("request");
const rorre = require("rorre");

const DEFAULT_SPINNER_OPTIONS = {
  instance: ora({
    discardStdin: process.platform !== "win32"
  }),
  progressPrefix: "",
  progressSuffix: "",
  successMessage: "100%"
};
const SAFE_RESOLVE_TIMEOUT = 2000;

const E = rorre.declare({
  PRM_DFP_NOT_STR: "<destFilePath> must be a string or left undefined to get a data buffer.",
  PRM_OPT_NOT_OBJ: "<options>` must be an object or left undefined.",
  PRM_OPT_SPR_NOT_ORA: "<options>.request.instance must be an instance or Ora.",
  PRM_OPT_REQ_NOT_OBJ: "<options>.request must be an object or left undefined.",
  PRM_URI_NOT_STR: "<uri> is mandatory and must be a string."
});

class Proload {
  constructor() {
    this.dataCurrentLength = 0;
    this.dataChunks = [];
    this.dataTotalLength = 0;
    this.destFilePath = null;
    this.uri = null;
    this.withSpinnerInstance = false;
  }

  init(uri, destFilePathOrOptions, options) {
    this.initProps(uri, destFilePathOrOptions, options);
  }

  initProps(uri, destFilePathOrOptions, options) {
    if (typeof uri !== "string") {
      throw E.PRM_URI_NOT_STR;
    }

    this.uri = uri;

    if (destFilePathOrOptions !== undefined) {
      if (destFilePathOrOptions.constructor.name === "Object") {
        this.initConfig(destFilePathOrOptions);

        return;
      }

      if (typeof destFilePathOrOptions !== "string") throw E.PRM_DFP_NOT_STR;

      this.destFilePath = destFilePathOrOptions;

      if (options !== undefined) {
        if (options.constructor.name !== "Object") throw E.PRM_OPT_NOT_OBJ;

        this.initConfig(options);

        return;
      }
    }

    this.initConfig({});
  }

  initConfig({ request: _request, spinner }) {
    const config = {
      spinner: DEFAULT_SPINNER_OPTIONS,
      request: {}
    };

    if (spinner !== undefined) {
      if (spinner.instance !== undefined) {
        if (spinner.instance.constructor.name !== "Ora") throw E.PRM_OPT_SPR_NOT_ORA;

        this.withSpinnerInstance = true;
      }

      // https://github.com/sindresorhus/ora/issues/132
      // eslint-disable-next-line no-param-reassign
      spinner.instance.discardStdin = process.platform !== "win32";

      config.spinner = {
        ...config.spinner,
        ...spinner
      };
    }

    if (_request !== undefined) {
      if (_request.constructor.name !== "Object") throw E.PRM_OPT_REQ_NOT_OBJ;

      config.request = {
        ...config.request,
        ..._request
      };
    }

    this.config = config;
  }

  run() {
    return new Promise((resolve, reject) => {
      if (this.destFilePath !== null) {
        const normalizedDestFilePath = this.destFilePath.replace(path.sep, "/");
        if (/\//.test(normalizedDestFilePath)) {
          const destFilePaths = normalizedDestFilePath.split("/");
          const destDirPath = destFilePaths.slice(0, destFilePaths.length - 1).join("/");

          if (!fs.existsSync(destDirPath)) {
            makeDir.sync(destDirPath);
          }
        }

        this.createRequest(resolve, reject).pipe(fs.createWriteStream(this.destFilePath));

        return;
      }

      this.createRequest(resolve, reject);
    });
  }

  createRequest(resolve, reject) {
    const { progressPrefix, progressSuffix, successMessage } = this.config.spinner;

    this.config.spinner.instance.start();

    return request(this.uri, this.config.request)
      .on("error", reject)
      .on("response", res => {
        if (!Number.isNaN(res.headers["content-length"])) {
          this.dataTotalLength = Number(res.headers["content-length"]);

          if (this.dataTotalLength > 0) {
            this.updateSpinner(`${progressPrefix || ""}  0%${progressSuffix || ""}`);

            return;
          }
        }

        this.updateSpinner("???%");
      })
      .on("data", chunk => {
        this.dataChunks.push(chunk);

        this.dataCurrentLength += chunk.length;

        if (this.dataTotalLength > 0) {
          const percentage = numeral(this.dataCurrentLength / this.dataTotalLength).format("0%");
          const text = `${progressPrefix || ""}${percentage.padStart(4, " ")}${progressSuffix ||
            ""}`;

          this.updateSpinner(text);
        }
      })
      .on("end", () => {
        this.config.spinner.instance.succeed(successMessage || "100%");

        if (!this.withSpinnerInstance) {
          this.config.spinner.instance.stop();
        }

        setTimeout(() => {
          const dataBuffer = Buffer.concat(this.dataChunks);

          resolve(dataBuffer);
        }, SAFE_RESOLVE_TIMEOUT);
      });
  }

  updateSpinner(message) {
    this.config.spinner.instance.text = message;
  }
}

function proload(uri, destFilePathOrOptions, options) {
  try {
    const instance = new Proload();
    instance.init(uri, destFilePathOrOptions, options);
    return instance.run();
  } catch (err) {
    return Promise.reject(err);
  }
}

module.exports = proload;

// Allow use of default import syntax in TypeScript:
module.exports.default = proload;
