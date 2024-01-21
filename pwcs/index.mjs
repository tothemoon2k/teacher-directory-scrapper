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

console.log(elementarySchools, middleSchools, highSchools);

async function scrapeSchool (school, url, level) {
    const page = await browser.newPage();

    await page.goto(`${url}/directory/index`);

    await page.waitForSelector(".panel-body");

    const teacherData = await page.evaluate(() => {

        const panels = document.querySelectorAll('.panel-body');
        
        return [...panels].map(panel => {
          const name = panel.querySelector('.panel-title').textContent;
          const image = panel.querySelector('img').src;
          const depts = panel.querySelector('.depts').textContent; 
          const email = panel.querySelector('.email a').href.slice(7);
      
          return {
            name, 
            image,
            depts,
            email
          };
        });
      
    });

    console.log(teacherData);
}


//for(let)

await scrapeSchool("yo mama high", highSchools[0], "high-school");