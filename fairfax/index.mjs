import puppeteerExtra from "puppeteer-extra"; 
import stealthPlugin from "puppeteer-extra-plugin-stealth"; 
import fs from "fs";

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

puppeteerExtra.use(stealthPlugin());

let browser = await puppeteerExtra.launch({
    headless: "new",
    // headless: "new",
    // devtools: true,
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
    //Executable path for mac
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
});


async function getSchools() {
    const page = await browser.newPage();

    try {
        await page.goto("https://www.cmsk12.org");
    } catch (error) {
        console.log("Error going to page");
    }

    const allSchoolsBtn = "button#gb-school-trigger";
    await page.waitForSelector(allSchoolsBtn);
    await page.click(allSchoolsBtn);

    await delay(3000);

    await page.waitForSelector('li.cs-mega-school');
    const schoolLis = await page.$$('li.cs-mega-school');

    for(let school of schoolLis){
        const name = await school.$eval('a', node => node.getAttribute('href'));
        if(name === "/elementary-schools") continue;
        if(name.slice(-2) !== "HS") continue;

        try {
            await go(name, `https://www.cmsk12.org${name}`);
        } catch (error) {
            console.log("Page closed due to error, moving onto next");
        }
    }
}

await getSchools();