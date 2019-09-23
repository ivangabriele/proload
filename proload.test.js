const fs = require("fs");
const mockProcess = require("jest-mock-process");
const ora = require("ora");

const proload = require("./proload");

const FILE_PATH = "./test.zip";
const FILE_SIZE = 3410026;
const FILE_URI = "https://www.gutenberg.org/files/308/308-h.zip";
const TIMEOUT = 30000;

describe("proload()", () => {
  let mockStderr;

  beforeAll(() => {
    mockStderr = mockProcess.mockProcessStderr();
  });

  afterAll(() => {
    mockStderr.mockRestore();
  });

  describe("Buffer", () => {
    test(
      "",
      async () => {
        const dataBuffer = await proload(FILE_URI);

        expect(mockStderr).toHaveBeenCalled();
        expect(dataBuffer.length).toStrictEqual(FILE_SIZE);
      },
      TIMEOUT
    );
  });

  describe("File", () => {
    test(
      "",
      async () => {
        await proload(FILE_URI, FILE_PATH);

        expect(mockStderr).toHaveBeenCalled();
        expect(fs.readFileSync(FILE_PATH).length).toStrictEqual(FILE_SIZE);
      },
      TIMEOUT
    );
  });

  describe("Ora", () => {
    describe("Buffer", () => {
      test(
        "",
        async () => {
          const spinner = ora();
          const options = {
            spinner: {
              instance: spinner
            }
          };
          const dataBuffer = await proload(FILE_URI, options);
          spinner.stop();

          expect(mockStderr).toHaveBeenCalled();
          expect(dataBuffer.length).toStrictEqual(FILE_SIZE);
        },
        TIMEOUT
      );
    });

    describe("File", () => {
      test(
        "",
        async () => {
          const spinner = ora();
          const options = {
            spinner: {
              instance: spinner
            }
          };
          await proload(FILE_URI, FILE_PATH, options);
          spinner.stop();

          expect(mockStderr).toHaveBeenCalled();
          expect(fs.readFileSync(FILE_PATH).length).toStrictEqual(FILE_SIZE);
        },
        TIMEOUT
      );
    });
  });
});
