const puppeteer = require('puppeteer');


async function destacaPrecios(url) {
    const browser = await puppeteer.launch({ headless: false }); // Ejecutar en modo no headless para ver la página
    const page = await browser.newPage();
    await page.goto(url);

    let precioSeleccionado;

    // Crear una promesa que se resuelve cuando se selecciona el precio
    const precioSeleccionadoPromise = new Promise(resolve => {
        page.exposeFunction('nodeConsoleLog', (message, precio) => {
            console.log(message)
            // cogemos el precio del mensaje y lo guardamos en precioSeleccionado
            precioSeleccionado = precio;
            console.log(precioSeleccionado);
            resolve();
        });
    });

    // Inyectar JavaScript en la página para resaltar todos los precios y agregar un evento de clic a ellos
    await page.evaluate(() => {
        const priceRegex = /([0-9.,_-])+(\s?)+([0-9.,_-])+(\s?)+(€|EUR)/g;
        const bodyText = document.body.innerText;
        const originalHTML = document.body.innerHTML;
        
        // Reemplazar todos los precios en el texto del cuerpo con el mismo precio envuelto en un span con un estilo y un evento de clic
        const newText = bodyText.replace(priceRegex, (match) => {
            return `<span style="background-color: yellow; cursor: pointer;" onclick="llamadaConsoleLog('${match}')">${match}</span>`;
        });
        
        document.body.innerHTML = newText;
        
        window.llamadaConsoleLog = async (precio) => {
            await window.nodeConsoleLog(`Precio seleccionado: ${precio}`, precio);
        };
    });

    // Esperar a que se seleccione el precio
    await precioSeleccionadoPromise;

    // Cerrar el navegador
    await browser.close();

    return precioSeleccionado;
}

async function llamadaEligePrecio(URL){
    return await destacaPrecios(URL);
}

module.exports = llamadaEligePrecio;