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
    headless: false,
    // headless: "new",
    // devtools: true,
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
    //Executable path for mac
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
});

let highSchools;
let middleSchools;
let elementarySchools;


async function getSchools() {
    const page = await browser.newPage();

    try {
        await page.goto("https://www.pwcs.edu/schools/index");
    } catch (error) {
        console.log("Error going to page");
    }

    await page.waitForSelector('li.list > a');

    const links = await page.$$eval('li.list > a', links => {
        return links.map(link => link.href) 
    })

    for(let link of links){
        await page.goto(link);

        await page.waitForSelector("div#main-content a")

        const hrefs = await page.evaluate(() => {
            const anchors = document.querySelectorAll('div#main-content a');
            return [...anchors].map(a => a.href); 
        });

        for(let href of hrefs){
            if(!href.endsWith(".edu/")){
                let index = hrefs.indexOf(href);
                if (index !== -1) {
                    hrefs.splice(index, 1);
                }
            }
        }
        
        if(link.includes("elementary_schools")){
            elementarySchools = hrefs;
        } else if (link.includes("middle_schools")){
            middleSchools = hrefs;
        } else if (link.includes("high_schools")){
            highSchools = hrefs;
        }
    }

    const minLength = Math.min(
        highSchools.length, 
        middleSchools.length,
        elementarySchools.length
    );

    highSchools = highSchools.slice(0, minLength); 
    middleSchools = middleSchools.slice(0, minLength);
    elementarySchools = elementarySchools.slice(0, minLength);    
}

await getSchools();

async function scrapeSchool (school, url, level) {
    const page = await browser.newPage();

    try {
        await page.goto(`${url}/directory/index`);
    } catch (error) {
        console.log("Error launching page");
        await page.close();
    }

    const bodyText = await page.evaluate(() => document.body.textContent);

    if(bodyText.includes('404')) {
        await page.close();
        throw new Error('Default staff directory path not matched'); 
    }

    await page.waitForSelector(".panel-body");

    await page.select('select#dirDept', 'teacher');

    await page.waitForNetworkIdle();

    await delay(1000);

    const panels = await page.$$('.panel-body');

    for (const panel of panels) {
        const name = await panel.$eval('.panel-title', el => el.textContent);
        const image = await panel.$eval('img', el => el.src);
        const dept = await panel.$eval('.depts', el => el.textContent);
        const email = await panel.$eval('.email a', el => el.href.slice(7));

        fs.appendFile(`./data/${level}/${school}.csv`, `${name},${dept},${email}\n`, function (err) {
            if (err) throw err;
            console.log('Teacher Added!');
        });
    }

    page.close();
}


for(let school of highSchools){
    let schoolName;
    try {
        const regex = /https:\/\/([^.]+)\.pwcs\.edu\//
        const match = school.match(regex);

        if(!match) {
            throw new Error('Regex error');
        }

        schoolName = match[1];
    } catch (error) {
        console.log("Not able to format school name")
    }

    try {
        await scrapeSchool(schoolName, school, "high-school");
    } catch (error) {
        console.log("There was an error, moving onto next school.", error);
    }
}

for(let school of middleSchools){
    let schoolName;
    try {
        const regex = /https:\/\/([^.]+)\.pwcs\.edu\//
        const match = school.match(regex);

        if(!match) {
            throw new Error('Regex error');
        }

        schoolName = match[1];
    } catch (error) {
        console.log("Not able to format school name")
    }

    try {
        await scrapeSchool(schoolName, school, "middle-school");
    } catch (error) {
        console.log("There was an error, moving onto next school.", error);
    }
}

for(let school of elementarySchools){
    let schoolName;
    try {
        const regex = /https:\/\/([^.]+)\.pwcs\.edu\//
        const match = school.match(regex);

        if(!match) {
            throw new Error('Regex error');
        }

        schoolName = match[1];
    } catch (error) {
        console.log("Not able to format school name")
    }

    try {
        await scrapeSchool(schoolName, school, "elementary-school");
    } catch (error) {
        console.log("There was an error, moving onto next school.", error);
    }
}

