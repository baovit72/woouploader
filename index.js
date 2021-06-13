const axios = require("axios");
const utils = require("./utils");
async function run() {
  const browser = await utils.getPuppeteerBrowser();
  const page = await browser.newPage();
  page.on("dialog", async (dialog) => {
    console.log(dialog.message());
    await dialog.dismiss();
  });
  async function waitThenGetElement(selector, timeout, unique) {
    unique = unique || true;
    timeout = timeout || 60000;
    await page.waitForSelector(selector, { timeout });
    await utils.sleep(2000);
    if (unique) {
      return await page.$(selector);
    }
    return await page.$$(selector);
  }
  async function x_waitThenGetElement(selector, timeout, unique) {
    unique = unique || true;
    timeout = timeout || 60000;
    await page.waitForXPath(selector, { timeout });
    await utils.sleep(2000);
    console.log(await page.$x(selector));
    if (unique) {
      return (await page.$x(selector))[0];
    }
    return await page.$x(selector);
  }
  async function typeToInput(selector, text) {
    await waitThenGetElement(selector);
    await page.type(selector, text, { delay: 50 });
  }
  async function evalScript(selector, evalCb) {
    await waitThenGetElement(selector);
    return await page.$eval(selector, evalCb);
  }
  const products = utils.deepClone(
    (await utils.readCsv("data.csv")).filter((p) => p.KC)
  );
  if (!products.length) {
    console.log("NO DATA FOUND");
    return 0;
  }
  const USER = products[0].USER;
  const PASSWORD = products[0].PASSWORD;
  const DESCRIPTION = products[0].DESC.split("\\n").join("\n");
  const METADESC = products[0].META;
  const KEYWORD = products[0].KEYWORD;
  const REGULAR = products[0].REG;
  const SALE = products[0].SALE;
  const SHORT = products[0].SHORT.split("\\n").join("\n");
  console.log(DESCRIPTION, SHORT);
  // console.log(products[0]);
  // console.log(USER, PASSWORD, DESCRIPTION, METADESC, KEYWORD);
  async function exec_woo(kc, kp1, kp2, joint, img, zip, cat, newcat) {
    const imageDir = "Images\\";

    img = utils.getAbsPath(imageDir + img);
    zip = utils.getAbsPath(imageDir + zip);
    // console.log(img, zip);
    if (!utils.pathExists(img)) return "IMAGE NOT EXISTS";
    if (!utils.pathExists(zip)) return "ZIP NOT EXISTS";
    try {
      await page.goto(
        "https://svgking.co/wp-admin/post-new.php?post_type=product"
      );
      await utils.sleep(3000);
      try {
        await waitThenGetElement("#title", 10000);
      } catch {
        if (!(await page.url()).includes("wp-login")) return "NETWORK PROBLEM";
        // console.log(USER);
        await typeToInput("#user_login", USER);
        await typeToInput("#user_pass", PASSWORD);
        await (await waitThenGetElement("#wp-submit")).click();
        try {
          await waitThenGetElement("#title");
        } catch {
          return "ACCOUNT PROBLEM";
        }
      }
      await page.evaluate(() => (window.onbeforeunload = null));
      await typeToInput(
        "#title",
        `${kc} ${kp1} ${joint}, ${kp2} ${joint} ${KEYWORD}`
      );

      await (await waitThenGetElement("#content-html")).click();
      await utils.sleep(1500);
      // console.log(DESCRIPTION);
      await page.evaluate(
        (DESCRIPTION, kc) => {
          document.querySelector("#content").value = DESCRIPTION.replace(
            /title_to_replace/g,
            kc
          );
        },
        DESCRIPTION,
        kc
      );

      await (await waitThenGetElement("#set-post-thumbnail")).click();
      await (await waitThenGetElement("#menu-item-browse")).click();
      await utils.sleep(1000);
      await (await waitThenGetElement("input[type='file']")).uploadFile(img);
      await typeToInput("#attachment-details-alt-text:not([readonly])", kc);
      await (
        await waitThenGetElement(".media-frame-toolbar .button-primary")
      ).click();
      await typeToInput("#focus-keyword-input-metabox", kc);

      await (
        await waitThenGetElement("#yoast-google-preview-title-metabox")
      ).click({ clickCount: 3 });
      // console.log(
      //   `${kc} ${kp2} ${KEYWORD}`,
      //   [...new Set(`${kc} ${kp2} ${KEYWORD}`.split(" "))].join(" ")
      // );
      await typeToInput(
        "#yoast-google-preview-title-metabox",
        [...new Set(`${kc} ${kp2} ${KEYWORD}`.split(" "))].join(" ")
      );
      await (
        await waitThenGetElement("#yoast-google-preview-slug-metabox")
      ).click({ clickCount: 3 });
      await typeToInput(
        "#yoast-google-preview-slug-metabox",
        `${kc} ${kp1} ${joint}, ${kp2} ${joint} ${KEYWORD}`
      );
      await typeToInput(
        "#yoast-google-preview-description-metabox",
        METADESC.replace(/title_to_replace/g, kc)
      );
      await typeToInput("#_regular_price", REGULAR);
      await typeToInput("#_sale_price", SALE);
      await (await waitThenGetElement("#_downloadable")).click();
      await (await waitThenGetElement("a.insert")).click();
      await typeToInput(".file_name > .input_text", kc);
      await (
        await waitThenGetElement(".file_url_choose .upload_file_button")
      ).click();
      await utils.sleep(1000);
      await (
        await waitThenGetElement("#__wp-uploader-id-5 #menu-item-upload")
      ).click();
      await utils.sleep(1000);
      console.log(zip);
      await (
        await waitThenGetElement("#__wp-uploader-id-5 input[type='file']")
      ).uploadFile(zip);
      await waitThenGetElement(
        "#__wp-uploader-id-5 #attachment-details-title:not([readonly])"
      );
      await (
        await waitThenGetElement(
          "#__wp-uploader-id-5 .media-frame-toolbar .button-primary"
        )
      ).click();
      await utils.sleep(1500);
      await (await waitThenGetElement("#excerpt-html")).click();
      await utils.sleep(1500);
      await page.evaluate(
        (SHORT, kc) => {
          document.querySelector("#excerpt").value = SHORT.replace(
            /title_to_replace/g,
            kc
          );
        },
        SHORT,
        kc
      );
      const cats = cat.split(",");
      const newCats = newcat.split(",");
      if (cats.length > 0) {
        console.log(cat, cats);
        for (let item of cats) {
          try {
            ////*[@id="product_catchecklist"]//*[text()=' CATS']
            const opt = await x_waitThenGetElement(
              `//*[@id='product_catchecklist']//*[text()=' ${item.trim()}']`
            );
            await opt.click();
          } catch (e) {
            console.log(e);
          }
        }
      }
      if (newCats.length > 0) {
        await (await waitThenGetElement("#product_cat-add-toggle")).click();
        for (let item of newCats) {
          try {
            await typeToInput("#newproduct_cat", item.trim());
            await (await waitThenGetElement("#product_cat-add-submit")).click();
          } catch (e) {
            console.log(e);
          }
        }
      }
      await page.evaluate(() => document.querySelector("#publish").click());
      await x_waitThenGetElement(
        "//*[@id='wpbody-content']/div[5]/a[text()='Add New']"
      );
      return "SUCCESS";
    } catch (e) {
      // console.log(e);
      utils.clog(e);
      return "NETWORK PROBLEM";
    }
  }
  for (let p of products) {
    let status = await exec_woo(
      p.KC,
      p.KP1,
      p.KP2,
      p.JOINT,
      p.IMG,
      p.ZIP,
      p.CAT,
      p.NEWCAT
    );

    if (status === "NETWORK PROBLEM") {
      status = await exec_woo(
        p.KC,
        p.KP1,
        p.KP2,
        p.JOINT,
        p.IMG,
        p.ZIP,
        p.CAT,
        p.NEWCAT
      );
    }
    p.done = status;
    await utils.writeCsv("output.csv", products);
  }
  // await browser.close();
}

run();
