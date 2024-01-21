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

async function go(school, url) {

    const page = await browser.newPage();

    try {
        await page.goto(url);
    } catch (error) {
        console.log("Error going to page");
    }


    await page.waitForSelector('ul#channel-navigation')
    const link = await page.$('ul#channel-navigation li:nth-child(2) > a');
    await link.hover();


    await delay(2000);


    const testAs = await page.$$('li > a');

    for (let i = 0; i < testAs.length; i++) {
        const test = testAs[i];
        const hasSpan = await test.$('span');
        if (hasSpan) {
            const text = await test.$eval('span', span => span.textContent);
            if (text === "Faculty & Staff"){
                test.click();
                break;
            }
        }
    }

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
            const title = await teacher.$eval('.staff-directory-detail', node => String(node.textContent));
            const email = await teacher.$eval('a[href^="mailto"]', node => node.getAttribute('href').slice(7));


            console.log(school.split("/")[1])
            fs.appendFile(`./data/${school.split("/")[1]}.csv`, `${name},${title.split(",")[1].trim()},${email}\n`, function (err) {
                if (err) throw err;
                console.log('Teacher Added!');
            });
        }
    }

    page.close();
    console.log("Done")
}

//go('AG-Middle', 'https://www.cmsk12.org/alexandergrahamMS');