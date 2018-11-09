const path = require('path');
const puppeteer = require('puppeteer');

let puppeteerConfig = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };

module.exports = async function (context, req) {

    let style;
    let backgroundColor = req.query.backgroundColor || 'transparent';
    let theme = req.query.theme || 'default';
    
    let width = parseInt(req.query.width) || 800;
    let height = parseInt(req.query.height) || 600;

    let input = req.query.input;

    if(!input) {
        context.res = {
            status: 400
        }

        return;
    }
    else {
        input = decodeURIComponent(input);
    }

    let output = req.query.output || 'svg';

    if(output != 'svg' && output != 'png' && output != 'pdf') {
        output = 'svg';
    }

    let mermaidConfig = { theme };

    const browser = await puppeteer.launch(puppeteerConfig);
    
    const page = await browser.newPage();
    page.setViewport({ width, height });
    await page.goto(`file://${path.join(__dirname, 'index.html')}`);
    await page.evaluate(`document.body.style.background = '${backgroundColor}'`);

    await page.$eval('#container', (container, input, mermaidConfig, style) => {
        container.innerHTML = input;
        window.mermaid.initialize(mermaidConfig);

        if (style) {
            const head = window.document.head || window.document.getElementsByTagName('head')[0];
            const style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet) {
              style.styleSheet.cssText = style;
            } else {
              style.appendChild(document.createTextNode(style));
            }

            head.appendChild(style);
        }

        window.mermaid.init(undefined, container);
    }, input, mermaidConfig, style);


    if(output == 'svg') {
        const svg = await page.$eval('#container', container => container.innerHTML);

        context.res = {
            body: svg,
            headers: { "Content-Type": 'image/svg+xml' }
        };
    }
    else if(output == 'png') {
        const clip = await page.$eval('svg', svg => {
            const react = svg.getBoundingClientRect();
            return { x: react.left, y: react.top, width: react.width, height: react.height };
          });

          let buffer = await page.screenshot({ clip, omitBackground: backgroundColor === 'transparent' });

          context.res = {
              body: buffer,
              headers: { "Content-Type": 'image/png' }
          };
    }
    else if(output == 'pdf') {
        let buffer = await page.pdf({  printBackground: backgroundColor !== 'transparent' });

        context.res = {
            body: buffer,
            headers: { "Content-Type": 'application/pdf' }
        };
    }

    browser.close()
};