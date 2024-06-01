const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const readline = require('readline');
const { Console } = require('console');
require('dotenv').config();

puppeteer.use(StealthPlugin());
puppeteer.use(RecaptchaPlugin());

const contrastockx = process.env.CONTRASENA_STOCKX;
const mailStockx = process.env.MAIL_STOCKX;

const contraseña = process.env.CONTRASENA;
const usuario = process.env.USUARIO;

const contraLaced = process.env.CONTRALACED;
const mailLaced = process.env.MAILLACED;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const tallas = {
    'USM': [3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22],
    'USW': [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22, 22.5, 23, 23.5],
    'UE': [35.5, 36, 36.5, 37.5, 38, 38.5, 39, 40, 40.5, 41, 42, 42.5, 43, 44, 44.5, 45, 45.5, 46, 47, 47.5, 48, 48.5, 49, 49.5, 50, 50.5, 51, 51.5, 52, 52.5, 53, 53.5, 54, 54.5, 55, 55.5, 56, 56.5]
};

function conversorTallas(talla, formatoOrigen, formatoDestino) {
    const indice = tallas[formatoOrigen].indexOf(talla);
    if (indice === -1) {
        console.log(`La talla ${talla} no se encuentra en el formato ${formatoOrigen}`);
        return null;
    }
    return tallas[formatoDestino][indice];
}

async function scrollToElement(page, selector) {
    await page.evaluate(selector => {
        document.querySelector(selector).scrollIntoView();
    }, selector);
}

async function busquedaStockx(browser, SKU, talla) {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        'accept-encoding': 'utf-8',
        'accept-language': 'es-ES',
        'referer': 'https://stockx.com/es-ES',
        'sec-ch-ua-platform': '"Windows"',
    });

    await page.goto('https://stockx.com/es-ES/');
    await page.waitForTimeout(5000); // Espera otros 5 segundos

    await page.waitForSelector('#onetrust-accept-btn-handler');
    const botonCookies = await page.$('#onetrust-accept-btn-handler');
    await botonCookies.click();


    await page.waitForTimeout(3000); // Espera otros 3 segundos

    await page.waitForSelector('#nav-login');
    const botonLogin = await page.$('#nav-login');
    await botonLogin.click();
    await page.waitForTimeout(3000); // Espera otros 3 segundos

    // Introducimos el email
    await page.type('#email-login', mailStockx);
    await page.waitForTimeout(2000); // Espera otros 2 segundos
    // Introducimos la contraseña
    await page.type('#password-login', contrastockx);

    await page.waitForTimeout(3000); // Espera otros 3 segundos

    await page.waitForSelector('#btn-login');
    const botonLogin2 = await page.$('#btn-login');
    await botonLogin2.click();


    await page.waitForTimeout(5000); // Espera otros 3 segundos


    await page.type('input[name="q"]', SKU);
    await page.focus('input[name="q"]');
    // Simulamos la presión de la tecla Enter para que se realice la búsqueda
    await page.keyboard.press('Enter');

    await page.waitForTimeout(5000); // Espera otros 5 segundos

    await page.waitForSelector('.css-1g4yje1');
    await page.click('.css-1g4yje1');

    await page.waitForTimeout(5000); // Espera otros 5 segundos

    // Espera a que el botón del selector de tallas esté disponible
    await page.waitForSelector('#menu-button-pdp-size-selector');

    // Haz clic en el botón del selector de tallas para desplegar las opciones
    await page.click('#menu-button-pdp-size-selector');

    // Espera a que el menú desplegable esté completamente abierto
    let menu = await page.waitForSelector('#menu-list-pdp-size-selector');

    // Espera explícitamente un poco antes de seleccionar los botones
    await page.waitForTimeout(2000); // Espera 5 segundos

    // Ahora deberías poder interactuar con los botones de las tallas
    let buttons = await menu.$$('button');

    // Itera sobre los botones y haz clic en el que tiene el texto "42.5"
    for (let button of buttons) {
        let buttonText = await page.evaluate(el => el.textContent, button);
        if (buttonText.includes(talla)) {
            await button.click();
            break;
        }
    }

    await page.waitForTimeout(2000); // Espera 2 segundos

    await scrollToElement(page, '.chakra-heading.css-1qzfqqa');

    await page.waitForTimeout(2000); // Espera 2 segundos
    // Pinchamos para vender
    let botonVenta = await page.waitForSelector('.chakra-button.css-rlrlo9');
    await botonVenta.click();



    await page.waitForTimeout(2000); // Espera 2 segundos



    // Botón primera venta
    try {
        await page.waitForSelector('.chakra-button.css-a09fr3', { timeout: 2000 });
        const botonLoEntiendo = await page.$('.chakra-button.css-a09fr3');
        await botonLoEntiendo.click();
    }
    catch (error) {
        console.log('No hay boton de lo entiendo');
    }

    // Botón modelo correcto, siempre es el nuestro el primero
    try {
        // Espera a que los botones "Yo tengo este" estén disponibles
        await page.waitForSelector('.chakra-button.css-1ruoi05', { timeout: 2000 });

        // Selecciona todos los botones "Yo tengo este"
        const botones = await page.$$('.chakra-button.css-1ruoi05');

        // Haz clic en el primer botón "Yo tengo este"
        await botones[0].click();
    }
    catch (error) {
        console.log('No se pudo seleccionar el primer botón "Yo tengo este"');
    }


    try {
        await page.waitForSelector('#tabs-:r8l:--tab-0', { timeout: 5000 });
        const botonGanarMas = await page.$('#tabs-:r8l:--tab-0');
        await botonGanarMas.click();
    } catch (error) {
        console.log('Ganar Más button not found, clicking other button');
        await page.waitForSelector('#tabs-:r8l:--tab-1', { timeout: 5000 });
        const otherButton = await page.$('#tabs-:r8l:--tab-1');
        await otherButton.click();
    }
    await page.waitForTimeout(3000); // Espera 2 segundos

    await page.waitForSelector('.chakra-text.css-1xrhe6v');
    // Selecciona todos los elementos de texto
    let elementosPrecioVenta = await page.$$('.chakra-text.css-1xrhe6v');

    // Obtiene el texto del primer elemento
    let precioVenta = await page.evaluate(element => element.textContent, elementosPrecioVenta[0]);

    let nuestroPayout = precioVenta.split('&')[0];

    return nuestroPayout;
}



async function busquedaWeTheNew(browser, SKU, talla) {
    const URL = 'https://sell.wethenew.com/login';
    const page = await browser.newPage();
    await page.goto(URL);

    // Espera hasta 10 segundos para que aparezca el botón
    await page.waitForSelector('#didomi-notice-agree-button', { timeout: 10000 });
    // Hace clic en el botón utilizando JavaScript
    const clicked = await page.evaluate(async () => {
        const botonCookies = document.querySelector('#didomi-notice-disagree-button');
        if (botonCookies) {
            botonCookies.click();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
            botonCookies.click();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
            console.log("HE CLICKADO");
            return true;
        } else {
            console.log("NO HE PODIDO CLICKAR");
            return false;
        }
    });

    if (!clicked) {
        return;
    }

    // Espera hasta que el banner de cookies ya no esté presente en el DOM
    await page.waitForSelector('#didomi-notice-disagree-button', { hidden: true });

    // Iniciamos sesión
    // Usando el atributo 'name' introducimos el correo electrónico
    await page.type('input[data-testid="email-input"]', usuario);
    // Usando el atributo 'name' introducimos la contraseña
    await page.type('input[data-testid="password-input"]', contraseña)

    await page.waitForTimeout(2000);

    // Guardamos el boton de inicio de sesión
    const botonInicioSesion = await page.$('[data-testid="submit-login-form-btn"]');
    // Pulsamos este botón
    await botonInicioSesion.click();

    await page.waitForTimeout(2000);

    // Tras iniciar sesión vamos al producto deseado
    await page.goto('https://sell.wethenew.com/listing?keywordSearch=' + SKU)


    await page.waitForTimeout(2000);

    // // Esperamos a que aparezca el botón para listear
    try {
        // Espera a que el botón esté visible
        try {
            await page.waitForSelector('.Buttonstyled__Button-sc-x94gu-0.edFBoy', { visible: true, timeout: 5000 });
        } catch (error) {
            console.log('El botón no se hizo visible en 5 segundos');
            return;
        }

        // Obtiene el botón
        const botonList = await page.$('.Buttonstyled__Button-sc-x94gu-0.edFBoy');

        // Comprueba si el botón existe
        if (!botonList) {
            console.log('El botón no existe');
            return;
        }

        // Hace clic en el botón
        await botonList.click();

        // Espera a que la lista de tallas esté visible
        try {
            await page.waitForSelector('.VariantItem_StyledVariantItemList__sORtw', { visible: true, timeout: 5000 });
        } catch (error) {
            console.log('La lista de tallas no se hizo visible en 5 segundos');
            return;
        }

        // Obtiene las tallas
        let tallasWTN = await page.$$('.VariantItem_StyledVariantItemList__sORtw');

        // Comprueba si las tallas existen
        if (!tallasWTN || tallasWTN.length === 0) {
            console.log('No se encontraron tallas');
            return;
        }



        let idTalla;
        let idTallaAlternativa;

        for (let tallaWTN of tallasWTN) {
            let textoTalla = await page.evaluate(el => el.textContent.trim(), tallaWTN);

            if (textoTalla === talla.toString()) {
                idTalla = await page.evaluate(el => el.id, tallaWTN);
                break;
            } else if (textoTalla.startsWith(talla.toString()) && idTallaAlternativa === undefined) {
                idTallaAlternativa = await page.evaluate(el => el.id, tallaWTN);
            }
        }


        if (idTalla === undefined) {
            if (idTallaAlternativa !== undefined) {
                idTalla = idTallaAlternativa;
            } else {
                console.error("La talla introducida no existe");
                return;
            }
        }


        if (idTalla === undefined) {
            console.error("La talla introducida no existe");
            return;
        }


        const botonTalla = await page.$(`[id="${idTalla}"]`)

        await botonTalla.click();

        await page.waitForSelector('.ModalListingForm_PriceButton__POsMt');
        let ultimosPrecios = await page.$$('.ModalListingForm_PriceButton__POsMt');
        let precioBajo;

        await page.waitForTimeout(1000);
        for (let precio of ultimosPrecios) {
            const quePrecio = await precio.$eval('p', el => el.innerText);
            if (quePrecio.includes('Lowest price')) {
                precioBajo = await precio.$eval('span', el => el.innerText);
                break;
            }
        }

        console.log(precioBajo);

        let nuestroPayout = precioBajo.trim().split('€')[0];

        console.log(nuestroPayout);



        return nuestroPayout;




    } catch (error) {
        console.log(error);
        console.log("El SKU introducido no existe");
        return;
    }


}



async function busquedaKlekt(browser, SKU, talla) {
    const URL = 'https://www.klekt.com/seller/find-product?query=';
    const page = await browser.newPage();
    await page.goto(URL + SKU);

    const precioMaximo = 15000;


    try {
        // Pinchamos en el enlace correspondiente
        await page.waitForSelector('.c-btn.c-btn--outline2', { timeout: 50000 });
        const boton = await page.$('.c-btn.c-btn--outline2');
        await boton.click();

        await page.waitForTimeout(4000);

        // Comprobamos si se trata de una zapatilla de mujer
        let tallaMujer = await page.$eval('h2', (element) => {
            return element.textContent.toLowerCase().includes('wmns');
        });

        // Imprimimos el titulo h2
        let titulo = await page.$eval('h2', (element) => {
            return element.textContent;
        });
        console.log(titulo);
        await page.waitForTimeout(2000);

        let tallaConvertida;

        if (tallaMujer) {
            tallaConvertida = conversorTallas(talla, 'UE', 'USW');
            console.log("ES TALLA DE MUJER")
        }
        else {
            tallaConvertida = conversorTallas(talla, 'UE', 'USM');
            console.log("ES TALLA DE HOMBRE")
        }

        if (!tallaConvertida) {
            console.log("No existe esa talla");
            return;
        }

        console.log(tallaConvertida)
        await page.waitForTimeout(2000);

        // Seleccionamos una talla
        // Hacemos clic en el menú desplegable para abrirlo
        // Esperamos a que el control del menú desplegable esté presente en la página
        await page.waitForSelector('.c-react-select__control.css-13cymwt-control');

        // Desplazamos hasta el control del menú desplegable
        await scrollToElement(page, '.c-react-select__control.css-13cymwt-control');
        // Hacemos clic en el control del menú desplegable
        await page.click('.c-react-select__control.css-13cymwt-control');


        // Esperamos a que el menú desplegable se abra
        await page.waitForSelector('.c-react-select__menu');
        await page.waitForTimeout(2000);



        await page.waitForSelector('.c-react-select__option');
        await page.waitForTimeout(1000);


        // Intentamos seleccionar la talla con el prefijo "US"
        let tallaOptionText = await page.evaluate((tallaConvertida) => {
            const options = Array.from(document.querySelectorAll('.c-react-select__option'));
            const option = options.find(option => option.textContent === `US${tallaConvertida}` || option.textContent === `${tallaConvertida}Y`);
            return option ? option.textContent : null;
        }, tallaConvertida);

        // Si no encontramos la talla con el prefijo "US", intentamos seleccionar la talla sin el prefijo
        if (!tallaOptionText) {
            tallaOptionText = await page.evaluate((tallaConvertida) => {
                const options = Array.from(document.querySelectorAll('.c-react-select__option'));
                const option = options.find(option => option.textContent === `${tallaConvertida}`);
                return option ? option.textContent : null;
            }, tallaConvertida);
        }

        // Si aún no encontramos la talla, intentamos seleccionar la talla con la parte entera de tallaConvertida
        if (!tallaOptionText) {
            let tallaParteEntera = Math.floor(tallaConvertida);
            tallaOptionText = await page.evaluate((tallaParteEntera) => {
                const options = Array.from(document.querySelectorAll('.c-react-select__option'));
                const option = options.find(option => option.textContent === `${tallaParteEntera}` || option.textContent === `US${tallaParteEntera}`);
                return option ? option.textContent : null;
            }, tallaParteEntera);
        }

        // Buscamos y hacemos clic en la opción de talla correspondiente
        if (tallaOptionText) {
            const opciones = await page.$$('.c-react-select__option');
            for (let opcion of opciones) {
                let value = await page.evaluate(el => el.textContent, opcion);
                if (value === tallaOptionText) {
                    await opcion.click();
                    break;
                }
            }
        }
        else {
            console.log("No existe esa talla en Klekt");
            return;
        }

        // Introducimos un precio elevado
        await page.type('.c-my-payout__input', precioMaximo.toString());

        // Esperamos que aparezca el payout actual
        await page.waitForSelector('.c-price-helper');

        // Leemos el valor del payout actual
        const precioFinal = await page.$eval('.c-price-helper', el => el.textContent);

        // Si no hay ninguna oferta pondremos la nuestra al precio máximo
        let nuestroPayout = precioMaximo;

        // Si ya hay una oferta, vemos cuanto nos darían con 1€ menos que la actual
        if (precioFinal.includes('€')) {
            // Nos quedamos solo con el precio
            const precioFinalNumero = precioFinal.split('€')[1];
            // Nuestro precio final
            nuestroPayout = precioFinalNumero - 1;
        }



        return nuestroPayout;

    } catch (error) {
        console.error("Klekt no tiene una zapatilla con ese SKU");
        return;
    }



}

async function busquedaHypeboost(browser, SKU, talla) {
    const URL = 'https://hypeboost.com/en/search/sell?keyword=';
    const page = await browser.newPage();
    await page.goto(URL + SKU);

    // Obtenemos todos los elementos con la clase 'grey'
    const elementosSKU = await page.$$eval('.grey', elementos => elementos.map(el => el.textContent));

    // Buscamos el SKU introducido en la lista de SKUs obtenidos
    const indiceSKU = elementosSKU.findIndex(sku => sku === SKU);
    if (indiceSKU === -1) {
        console.log("El SKU introducido no existe en Hypeboost");
        return;
    }

    // Pinchamos en el enlace correspondiente al SKU introducido
    const enlacesZapatillas = await page.$$('a');
    await enlacesZapatillas[indiceSKU].click();

    // Esperamos a que el selector de tallas esté disponible
    await page.waitForSelector("#size_id");

    // Obtenemos todas las tallas disponibles
    const tallasDisponibles = await page.$$eval('#size_id option', opciones => opciones.map(opcion => opcion.textContent.replace(/\s+/g, ' ').trim()));


    // Vamos a formatear nuestras tallas 42.5 a formato Hypeboost que sería 42 ½ o 42 ⅔

    // Si la talla es un número entero
    if (talla === Math.floor(talla)) {
        // Convertimos la talla a un string
        let tallaStr = talla.toString();
        // Buscamos la talla en tallasDisponibles que es igual a tallaParteEntera
        tallaHypeboost = tallasDisponibles.find(t => t === tallaStr);

        // Si en la web no hay talla 39, ya que solo hay 39 ⅓, buscamos la talla en tallasDisponibles que contiene 39
        if (!tallaHypeboost) {
            tallaHypeboost = tallasDisponibles.find(t => t.startsWith(tallaStr));
        }
    } else {
        // Buscamos la talla en tallasDisponibles que comienza con tallaParteEntera y tiene un espacio después
        tallaHypeboost = tallasDisponibles.find(t => t.startsWith(Math.floor(talla).toString() + ' '));
    }


    // Verificamos si la talla elegida está en la lista de tallas disponibles
    if (!tallasDisponibles.includes(tallaHypeboost)) {
        console.log("La talla elegida no está entre las disponibles");
        return;
    }



    // Hacemos clic en el elemento select
    await page.click('#size_id');

    // Esperamos un poco para que se despliegue el menú desplegable
    await page.waitForTimeout(1000);

    // Seleccionamos la opción que tiene el texto que coincide con tallaHypeboost
    await page.evaluate((talla) => {
        let select = document.querySelector('#size_id');
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].textContent.trim() == talla) {
                select.selectedIndex = i;
                let event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
                break;
            }
        }
    }, tallaHypeboost);



    //Vemos cuál es el precio actual más bajo
    let precioActual;
    try {
        // Intentamos obtener el precio actual más bajo
        // Esperamos hasta que el precio actual más bajo esté disponible
        await page.waitForFunction(() => document.querySelector('.size-lowest-ask-price').textContent.length > 0);
        precioActual = await page.$eval('.size-lowest-ask-price', el => el.textContent);
    } catch (error) {
        // Si no podemos obtener el precio actual, asumimos que no hay oferta para esa talla
        console.log("No hay oferta para esa talla");
        precioActual = "1000";
    }



    const precioNuevo = Number(precioActual) - 1;



    //Introducimos el precio al que queremos vender
    await page.type('#price', precioNuevo.toString());
    // Simulamos la presión de la tecla espacio para que se actualice el payout
    await page.keyboard.press('Space');

    //Vemos cuanto dinero nos darían
    await page.waitForSelector('#payout-price + strong');
    const precioFinal = await page.$eval('#payout-price + strong', el => el.textContent);


    nuestroPayout = Number(precioFinal.split('€')[0].replace(',', '.'));

    return nuestroPayout;

}


async function busquedaLaced(browser, SKU, talla) {
    const URL = 'https://www.laced.com/users/sign_in';
    const page = await browser.newPage();
    await page.goto(URL);

    // Espera a que el botón de aceptar cookies esté visible y haz clic en él
    try {
        await page.waitForTimeout(3000);
        await page.waitForSelector('.css-1if36b4', { timeout: 5000 });
        await page.click('.css-1if36b4');
        console.log('Se ha aceptado el uso de cookies');
    } catch (err) {
        console.error('No se encontró el botón de aceptar cookies:', err);
    }

    try {
        await page.waitForSelector('.css-gslito', { timeout: 5000 });
        await page.click('.css-gslito');
        console.log('Se ha hecho clic en el botón Submit');
    } catch (err) {
        console.error('No se encontró el botón Submit');
    }



    // Nos logueamos
    // Introducimos el correo electrónico
    await page.waitForSelector('#user_email');
    await page.type('#user_email', mailLaced);
    // Introducimos la contraseña
    await page.waitForSelector('#user_password');
    await page.type('#user_password', contraLaced);

    // Presiona Enter para iniciar sesión
    await page.keyboard.press('Enter');

    // Espera un poco para que la página procese el inicio de sesión
    await page.waitForTimeout(5000);

    //Vamos a la página de venta
    await page.goto(`https://www.laced.com/account/selling/new/${SKU}`);
    // Espera a que el menú desplegable de tallas esté visible
    await page.waitForSelector('#sale_collection_size_conversion');

    let tallaConvertida = conversorTallas(talla, 'UE', 'USM');

    await page.waitForTimeout(5000);

    await page.evaluate((talla) => {
        let select = document.querySelector('#sale_collection_size_conversion');
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].innerText.includes(`US ${talla}`)) {
                select.selectedIndex = i;
                let event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
                break;
            }
        }
        if (select.selectedIndex == -1) {
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].innerText.includes(`US ${Math.floor(talla)}`)) {
                    select.selectedIndex = i;
                    let event = new Event('change', { bubbles: true });
                    select.dispatchEvent(event);
                    break;
                }
            }
        }
    }, tallaConvertida);

    await page.waitForTimeout(2000);

    await page.waitForSelector('.footnote.total');
    const precioFinal = await page.$eval('.footnote.total td:nth-child(2)', el => {
        let precioTexto = el.textContent;
        let precioSinEuro = precioTexto.replace(' €', '');
        let precioConPunto = precioSinEuro.replace(',', '.');
        return parseFloat(precioConPunto);
    });

    return precioFinal;

}



async function comparaPayout(SKU, TALLA, webs) {
    const browser = await puppeteer.launch({ headless: "new" });
    try {

        let payoutStockx, payoutWeTheNew, payoutKlekt, payoutHypeboost, payoutLaced;

        //Arreglar wethenew
        // try {
        //     payoutWeTheNew = await busquedaWeTheNew(browser, SKU, Number(TALLA));
        // } catch (err) {
        //     console.error('Error en busquedaWeTheNew:', err);
        // }


        if (webs.klekt) {
            try {
                payoutKlekt = await busquedaKlekt(browser, SKU, Number(TALLA));
            } catch (err) {
                console.error('Error en busquedaKlekt:', err);
            }
        }else{
            payoutKlekt = null;
        }

        if (webs.hypeboost) {
            try {
                payoutHypeboost = await busquedaHypeboost(browser, SKU, Number(TALLA));
            } catch (err) {
                console.error('Error en busquedaHypeboost:', err);
            }
        }else{
            payoutHypeboost = null;
        }

        if (webs.laced) {
            try {
                payoutLaced = await busquedaLaced(browser, SKU, Number(TALLA));;
            } catch (err) {
                console.error('Error en busquedaLaced:', err);
            }
        }
        else{
            payoutLaced = null;
        }


        // try {
        //     payoutStockx = await busquedaStockx(browser, SKU, Number(TALLA));
        // } catch (err) {
        //     console.error('Error en busquedaStockx:', err);
        // }

        // let messageStockx = `El payout de Stockx es: ${payoutStockx} €`;
        // let messageWeTheNew = `El payout de WeTheNew es: ${payoutWeTheNew} €`;
        // let messageKlekt = `El payout de Klekt es: ${payoutKlekt} €`;
        // let messageHypeboost = `El payout de Hypeboost es: ${payoutHypeboost} €`;
        // let messageLaced = `El payout de Laced es: ${payoutLaced}`;

        // Cierra el navegador después de que todas las promesas estén resueltas
        await browser.close();

        return { payoutKlekt, payoutHypeboost, payoutLaced};
    } catch (err) {
        console.error(err);
    } finally {
        rl.close();
    }
}

async function llamadaComparaPayout(SKU, TALLA, webs) {
    return await comparaPayout(SKU, TALLA, webs);
}

module.exports = llamadaComparaPayout;


// async function comparaPayout(SKU, TALLA) {
//     const browser = await puppeteer.launch({ headless: false });
//     try {
//         const payoutKlekt = await busquedaWeTheNew(browser, SKU, Number(TALLA));

//         let messageKlekt = `El payout de Klekt es: ${payoutKlekt} €`;

//         return { payoutKlekt };
//     } catch (err) {
//         console.error(err);
//     } finally {
//         await browser.close();
//     }
// }
