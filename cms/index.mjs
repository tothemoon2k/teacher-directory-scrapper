import puppeteerExtra from "puppeteer-extra"; 
import stealthPlugin from "puppeteer-extra-plugin-stealth"; 
import fs from "fs";

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

async function go() {
    puppeteerExtra.use(stealthPlugin());

    const browser = await puppeteerExtra.launch({
        headless: false,
        // headless: "new",
        // devtools: true,
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
        //Executable path for mac
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });
  
    const page = await browser.newPage();

    try {
        await page.goto(
          "https://www.cmsk12.org/domain/300"
        );
    } catch (error) {
        console.log("Error going to page");
    }

    await page.waitForSelector('ul#channel-navigation')

    const link = await page.$('ul#channel-navigation li:nth-child(2) > a');
    await link.hover();

    const facultyLink = await page.$('ul.sw-channel-dropdown > li ul > li:nth-of-type(2) a');
    await facultyLink.click();

    let teacherSelector = 'li[data-name="Teachers"]';
    await page.waitForSelector(teacherSelector);
    
    await page.click(teacherSelector);




    /*
    const dropdownUl = await page.$('ul#sw-channel-dropdown');
    const firstChild2 = await dropdownUl.$('li:first-child');

    console.log(firstChild2.getProperties('textContent').jsonValue());

    
    const navUl = await firstChild2.$('ul:first-child')

    const navUlChildren = await navUl.$$('li');

    const staffLi = navUlChildren[1];

    staffLi.$('a:first-child').click();
*/

}

go();