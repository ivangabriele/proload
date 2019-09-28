const fs = require("fs");
const mockProcess = require("jest-mock-process");
const ora = require("ora");
const rimraf = require("rimraf");

const proload = require("./proload");

const TEST_DIR_PATH = "./.test";
const TEST_TIMEOUT = 120000;

const FILES = [
  {
    dirPath: TEST_DIR_PATH,
    fileName: "test.zip",
    fileSize: 3410026,
    fileUri: "https://www.gutenberg.org/files/308/308-h.zip"
  },
  {
    dirPath: TEST_DIR_PATH,
    fileName: "test.tsv",
    fileSize: 25850780,
    fileUri: "http://www.lexique.org/databases/Lexique383/Lexique383.tsv"
  }
];

describe("proload()", () => {
  let mockStderr;

  beforeAll(() => {
    mockStderr = mockProcess.mockProcessStderr();
  });

  afterAll(() => {
    mockStderr.mockRestore();
    rimraf.sync(TEST_DIR_PATH);
  });

  FILES.forEach(({ dirPath, fileName, fileSize, fileUri }) => {
    const filePath = `${dirPath}/${fileName}`;

    describe(fileUri, () => {
      beforeEach(() => {
        rimraf.sync(dirPath);
      });

      describe("Buffer", () => {
        test(
          "should match the expected buffer size",
          async () => {
            const dataBuffer = await proload(fileUri);

            expect(mockStderr).toHaveBeenCalled();
            expect(dataBuffer.length).toStrictEqual(fileSize);
          },
          TEST_TIMEOUT
        );
      });

      describe("File", () => {
        test(
          "should match the expected file size",
          async () => {
            await proload(fileUri, filePath);

            expect(mockStderr).toHaveBeenCalled();
            expect(fs.readFileSync(filePath).length).toStrictEqual(fileSize);
          },
          TEST_TIMEOUT
        );
      });

      // eslint-disable-next-line no-loop-func
      describe("Ora", () => {
        describe("Buffer", () => {
          test(
            "should match the expected buffer size",
            async () => {
              const spinner = ora();
              const options = {
                spinner: {
                  instance: spinner
                }
              };
              const dataBuffer = await proload(fileUri, options);
              spinner.stop();

              expect(mockStderr).toHaveBeenCalled();
              expect(dataBuffer.length).toStrictEqual(fileSize);
            },
            TEST_TIMEOUT
          );
        });

        describe("File", () => {
          test(
            "should match the expected file size",
            async () => {
              const spinner = ora();
              const options = {
                spinner: {
                  instance: spinner
                }
              };
              await proload(fileUri, filePath, options);
              spinner.stop();

              expect(mockStderr).toHaveBeenCalled();
              expect(fs.readFileSync(filePath).length).toStrictEqual(fileSize);
            },
            TEST_TIMEOUT
          );
        });
      });
    });
  });
});
