window.crearProducto = function () {
  const form = document.getElementById('zapatillaForm');
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const sku = document.getElementById('sku').value;
    const talla = document.getElementById('talla').value;
    const nombre = document.getElementById('nombre').value;

    fetch('/api/zapatilla', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        SKU: sku,
        talla: talla,
        nombre: nombre
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Check if the response body is not empty
        if (response.headers.get('content-length') === '0' || !response.headers.get('content-type').includes('application/json')) {
          console.log('Zapatilla created successfully');
          return;
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          console.log('Zapatilla created successfully', data);
        }
      })
      .catch((error) => {
        console.error('An error occurred while creating the zapatilla', error);
      });
  });
}


window.mostrarZapatillas = function () {
  fetch('/api/zapatillas')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(zapatillas => {
      const dataElement = document.getElementById('data');
      dataElement.innerHTML = '';
      zapatillas.forEach(zapatilla => {
        dataElement.innerHTML += `<p>${zapatilla.nombre} - ${zapatilla.SKU} - ${zapatilla.talla}</p>`;
      });
    })
    .catch(error => {
      console.error('An error occurred while fetching the zapatillas', error);
    });
}


window.toggleFormCrear = function () {
  const formContainer = document.getElementById('formContainer');
  if (formContainer.style.display === 'none') {
    formContainer.style.display = 'block';
  } else {
    formContainer.style.display = 'none';
  }
}

window.toggleFormBusqueda = function () {
  const formContainer2 = document.getElementById('formContainerBusqueda');
  if (formContainer2.style.display === 'none') {
    formContainer2.style.display = 'block';
  } else {
    formContainer2.style.display = 'none';
  }
}

window.onload = function () {
  const button1 = document.getElementById('crea-zapatilla');
  button1.addEventListener('click', function () {
    window.toggleFormCrear();
    window.crearProducto();
  });

  const button2 = document.getElementById('inventario');
  button2.addEventListener('click', window.mostrarZapatillas);

  const skuInput = document.getElementById('skuB');
  const tallaInput = document.getElementById('tallaB');
  const buscarPrecioBtn = document.getElementById('buscarPrecio');

  buscarPrecioBtn.addEventListener('click', function() {
    window.toggleFormBusqueda();
    const sku = skuInput.value;
    const talla = tallaInput.value;
    window.precioZapatilla(sku, talla);
  });
}

window.precioZapatilla = function (sku, talla) {
  fetch(`/api/modelo?SKU=${encodeURIComponent(sku)}&talla=${encodeURIComponent(talla)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const precioResultado = document.getElementById('data');
      precioResultado.innerHTML = `
        <p>${data.messageKlekt}</p>
        <p>${data.messageHypeboost}</p>
        <p>${data.messageLaced}</p>
      `;
    })
    .catch(error => {
      console.error('An error occurred while fetching the price', error);
    });
}