const puppeteer = require('puppeteer');


async function verificarSelectorEnHTML(url, selectorCSS) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const priceRegex = /([0-9.,_-])+(\s?)+([0-9.,_-])+(\s?)+(€|EUR)/g;
    //Sin esta línea no funciona headless
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36")
    await page.goto(url);

    let precio;

    try {
        await page.waitForTimeout(3000);
        await page.waitForSelector(selectorCSS);
        console.log(`El selector CSS "${selectorCSS}" está presente en el HTML.`);
        const elemento = await page.$eval(selectorCSS, elemento => elemento.textContent.trim());
        //Si encuentra el selector, que el texto que contenga lo filtre para devolver la coincidencia con la expresión regular
        const elementoFiltrado = elemento.match(priceRegex);
        precio = elementoFiltrado;
        console.log(`Contenido del selector CSS "${elementoFiltrado}":`);
    }
    catch (error) {
        precio = null;
        console.log(`El selector CSS "${selectorCSS}" no está presente en el HTML.`);
    }
    finally {
        await browser.close();
    }

    if (precio != null) {
        precio = precio[0].replace(/€/g, '').trim(); // Elimina el símbolo del euro
    } else {
        precio = null;
    }
    console.log("De aqui devuelve " + precio)
    return precio;
}


async function highlightTitles(url) {
    // Inicia el navegador
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();


    // Navega a la página deseada
    await page.goto(url);

    // Variable para guardar el selector encontrado
    let selectorEncontrado = null;

    // Ejecuta JavaScript en el contexto de la página para resaltar los títulos y agregar eventos de clic
    await page.exposeFunction('logSelector', (selector, content) => {
        selectorEncontrado = { selector, content };
        console.log(`Selector CSS: ${selector}, Content: "${content}"`);
    });

    await page.evaluate(() => {
        const priceRegex = /([0-9.,_-])+(\s?)+([0-9.,_-])+(\s?)+(€|EUR)/g;
        // Función para obtener el selector CSS de un elemento sin el tipo de elemento
        function getCssSelector(element) {
            let selector = '';
            if (element.id) {
                selector += `#${element.id}`;
            }
            if (element.className) {
                selector += `.${element.className.trim().replace(/\s+/g, '.')}`;
            }
            return selector;
        }

        // Selecciona todos los títulos (h1, h2, h3, h4, h5, h6)
        const elements = Array.from(document.querySelectorAll('span, div, p, h1, h2, h3, h4, h5, h6, a'));
        const titles = elements.filter(element => element.textContent.match(priceRegex));

        titles.forEach(title => {
            title.style.backgroundColor = 'yellow'; // Cambia el fondo a amarillo
            title.style.color = 'red';              // Cambia el texto a rojo
            title.style.border = '2px solid black'; // Añade un borde negro

            title.addEventListener('click', (event) => {
                const cssSelector = getCssSelector(event.target);
                let content = event.target.textContent.trim();
                let match = content.match(priceRegex);
                if (match) {
                    content = match[0].replace(/^[^\d]+|[^\d]+$/g, '').trim(); // Elimina los caracteres no numéricos al principio y al final
                } else {
                    content = null;
                }
                content = content.replace(/€/g, '').trim(); // Elimina el símbolo del euro
                window.logSelector(cssSelector, content); // Llama a la función expuesta
            });
        });
    });

    // Espera 30 segundos o hasta que se encuentre un selector
    const startTime = Date.now();
    while (!selectorEncontrado && (Date.now() - startTime < 30000)) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Espera 100ms antes de verificar nuevamente
    }

    // Imprime el selector encontrado, si hay uno
    if (selectorEncontrado) {
        console.log(`Selector encontrado: ${selectorEncontrado.selector}`);
        console.log(`Contenido: ${selectorEncontrado.content}`);
    } else {
        console.log('No se hizo clic en ningún título.');
        return null;
    }

    // Cierra el navegador
    await browser.close();

    console.log(selectorEncontrado);
    return selectorEncontrado;
}

async function precioSelectorPrimeraVez(URL) {
    const precio = await highlightTitles(URL);
    return precio;
}

async function actualizamosPrecioProducto(URL, selectorCSS) {
    const precio = await verificarSelectorEnHTML(URL, selectorCSS);
    return precio;
}


// highlightTitles('https://www.zalando.es/nike-sportswear-dunk-retro-zapatillas-summit-whitelight-smoke-greyplatinum-tintwhite-ni112o0tc-a17.html','.sDq_FX._4sa1cA.FxZV-M.HlZ_Tf')

// highlightTitles('https://www.zalando.es/nike-sportswear-dunk-retro-zapatillas-summit-whitelight-smoke-greyplatinum-tintwhite-ni112o0tc-a17.html');

// highlightTitles("https://www.bershka.com/es/camiseta-manga-corta-cropped-c0p163901306.html?colorId=106&stylismId=137")

module.exports = { precioSelectorPrimeraVez, actualizamosPrecioProducto };