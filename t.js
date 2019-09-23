// const ora = require("ora");

const proload = require("./proload");

// const spinner = ora();

(async () => {
  try {
    // const data = await proload("http://www.gutenberg.org/cache/epub/15557/pg15557.txt", "test.txt");
    // const data = await proload("http://www.gutenberg.org/cache/epub/15557/pg15557.txt");
    const data = await proload("http://www.gutenberg.org/cache/epub/15557/pg15557.txt", {
      spinner: {
        // instance: spinner
      }
    });
    // spinner.stop();
    console.info(data.length);
  } catch (err) {
    console.error(err);
  }
})();
