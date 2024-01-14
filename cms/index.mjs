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
          "https://www.cmsk12.org/alexandergrahamMS"
        );
    } catch (error) {
        console.log("Error going to page");
    }






    await page.waitForSelector('ul#channel-navigation')
    const link = await page.$('ul#channel-navigation li:nth-child(2) > a');
    await link.hover();


    const facultyLink = await page.$('ul.sw-channel-dropdown > li ul > li:nth-of-type(2) a');
    await facultyLink.click();


    const teacherSelector = 'li[data-name="Teachers"]';
    await page.waitForSelector(teacherSelector);
    await page.click(teacherSelector);








    await page.waitForSelector('ul.staff-directory-pagination-list');
    const paginationUl = await page.$('ul.staff-directory-pagination-list');
    const pageCount = await page.evaluate(el => el.children.length, paginationUl);




    for (let i = 1; i <= pageCount; i++) {
        console.log("\n NEW PAGE ||||||||||||||||||||| \n")
        
        await page.click(`ul.staff-directory-pagination-list li:nth-of-type(${i})`);
        const staffListSelector = "div.org-details-tab-panel.teachers ul";
        await page.waitForSelector(staffListSelector);

        await delay(1000);

        const ul = await page.$(staffListSelector);
        const teachersUl = await ul.$$('li');

        for(let teacher of teachersUl){
            const name = await teacher.$eval('.staff-directory-name', node => node.textContent);
            const title = await teacher.$eval('.staff-directory-detail', node => node.textContent);
            const email = await teacher.$eval('a[href^="mailto"]', node => 
                node.getAttribute('href').slice(7));
            console.log(name, title, email);
        }
    }
}

go();