import { fetchProductData, error } from "./databaseConnection.js";

let bestand = [];
function loadBestandFromLocalStorage() {
  const bestandData = localStorage.getItem('bestand');
  console.log(localStorage)
  if (bestandData !== 'undefined' && bestandData) {
    console.log('test')
    bestand = JSON.parse(bestandData);
  } else {
    bestand = [{
      description: 'tomate',
      menge: 2,
      barcode:'001'
    }, {
      description: 'apfel',
      menge: 2,
      barcode:'002'
    }];
    saveBestandToLocalStorage(bestand);
  }
}

function saveBestandToLocalStorage(bestand) {
  localStorage.setItem('bestand', JSON.stringify(bestand));
}

window.onload = function() {
  console.log(bestand)
  loadBestandFromLocalStorage();
  renderBestandHtml();
}

//scanner
let scanner = false;
document.querySelector('.scanning-btn').addEventListener('click', () => {
  if (!scanner) {
    initializeScanner();
    scanner = true; 
    document.querySelector('.scanning-btn').remove();
    console.log('Scanner gestartet');
    document.querySelector('.scanning-btn-container').classList.remove('flex')
    document.querySelector('.bestand-produkte-container').classList.remove('flex')
    document.querySelector('.scanning-btn-container').classList.add('hidden')
    document.querySelector('.bestand-produkte-container').classList.add('hidden')
    document.getElementById('reader').classList.remove('hidden')
    document.getElementById('reader').classList.add('flex')

    document.getElementById('reader__scan_region').classList.add(
      'flex',
      'justify-center',
      'items-center'
    )
    
    /*
    document.getElementById('html5-qrcode-button-camera-permission').classList.add(
      'bg-green-400',
      'rounded-lg',
      'text-black',
      'w-auto',
      'p-2',
      'text-semibold',
      'mb-2',
      'shadow-xl',
      'hover:bg-green-600'
    )
    document.getElementById('html5-qrcode-anchor-scan-type-change').classList.add(
      'hover:text-green-600'
    )
    */
    getState()
  }
});

document.querySelector('.nochmals-scannen-btn').addEventListener('click', () => {
  if (!scanner) {
    scanner = true; 
    initializeScanner();
    document.querySelector('.nochmals-scannen-btn').remove();
    console.log('Scanner gestartet');
  }
});

function initializeScanner() {
  scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
          width: 250,
          height: 250,
      },
      fps: 20,
  });
  scanner.render(success, error);
}
  
function success(result) {
    document.querySelector('.nochmals-scannen-btn').style.display = "block"; 
    scanner.clear();
    document.getElementById('reader').remove();
    getProduktData(result);
}
//maybe probleme mit error function also in verbrauch.js angegeben das es das braucht
/*
//damit ich nicht qr-scanner verwenden muss weil schlechte kamera auf computer
document.querySelector('.scanning-btn').addEventListener('click', () => {
  getProduktData('151212300000');
});
*/


let neuesProdukt = '';
async function getProduktData(result) {
  try {
    let upcCode = result;
    neuesProdukt = await fetchProductData(upcCode); 
    addToBestand(neuesProdukt);
    renderBestandHtml();
    console.log(bestand)
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error); 
  }
}

function renderBestandHtml() {
  const bestandContainer = document.querySelector('.bestand-produkte-container');
  bestandContainer.innerHTML = '';

  bestand.forEach(produkt => {
    const produktContainer = document.createElement('div');
    produktContainer.classList.add(
      'produkt-container', 
      `produkt-container-${produkt.barcode}`, 
      'flex', 
      'items-center',
      'w-full',
      'justify-start', 
      'rounded-lg',
      'gap-x-20',
      'p-3',
      'm-2',
      'shadow-md',
      'bg-c2'
    );
    console.log(produktContainer)
    
    const produktNameDiv = document.createElement('div');
    produktNameDiv.textContent = produkt.description || produkt.title || produkt.barcode;
    produktContainer.appendChild(produktNameDiv);
    produktNameDiv.classList.add(
      'produkt-name',
      'basis-1/4',
    );


    const mengeDiv = document.createElement('div');
    mengeDiv.textContent = produkt.menge;
    produktContainer.appendChild(mengeDiv);
    mengeDiv.classList.add(
      'produkt-menge',
      'basis-1/4'
    );


    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add(
      'button-container',
      'basis-1/2',
    );

    const plusButton = document.createElement('button');
    plusButton.textContent = '+';
    plusButton.dataset.produktCode = produkt.barcode;
    buttonContainer.appendChild(plusButton);
    plusButton.classList.add(
      'plus-btn',
      'bg-green-400',
      'hover:bg-green-600',
      'h-9',
      'w-9',
      'rounded-full',
      'mr-2'
    );
    plusButton.addEventListener('click', (event) => {
      const produktCode = event.target.dataset.produktCode;
      const produkt = bestand.find(p => p.barcode === produktCode);
      console.log(bestand)
      console.log(event.target.dataset)
      addToBestand(produkt);
    })

    let intervalId;
    let timeoutId;

    plusButton.addEventListener('mousedown', (event) => {
      const produktCode = event.target.dataset.produktCode;
      const produkt = bestand.find(p => p.barcode === produktCode);
      addToBestand(produkt);
      timeoutId = setTimeout(function() {
        intervalId = setInterval(function() {
          addToBestand(produkt);
        }, 100); 
      }, 700); 
    })


    const minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.dataset.produktCode = produkt.barcode;
    buttonContainer.appendChild(minusButton);
    minusButton.classList.add(
      'minus-btn',
      'bg-green-400',
      'hover:bg-green-600',
      'h-9',
      'w-9',
      'rounded-full',
    );
    minusButton.addEventListener('click', (event) => {
      const produktCode = event.target.dataset.produktCode;
      const produkt = bestand.find(p => p.barcode === produktCode);
      removeFromBestand(produkt);
    })
    minusButton.addEventListener('mousedown', (event) => {
      const produktCode = event.target.dataset.produktCode;
      const produkt = bestand.find(p => p.barcode === produktCode);
      removeFromBestand(produkt);
      timeoutId = setTimeout(function() {
        intervalId = setInterval(function() {
          removeFromBestand(produkt);
        }, 100); 
      }, 700); 
    })

    document.addEventListener('mouseup', function(event) {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    });


    produktContainer.appendChild(buttonContainer);
    bestandContainer.appendChild(produktContainer);
  });
}


function addToBestand(produkt) {
  console.log(bestand)
  const vorhandenesProdukt = bestand.find(p => p.barcode === produkt.barcode);
  if (vorhandenesProdukt) {
    vorhandenesProdukt.menge++;
  } else {
    bestand.push(produkt);
    produkt.menge = 1;

  }
  saveBestandToLocalStorage(bestand);
  renderBestandHtml(); 
}

function removeFromBestand(produkt) {
  const index = bestand.findIndex(p => p.barcode === produkt.barcode);
  if (index !== -1) {
    if (bestand[index].menge > 1) {
      bestand[index].menge--;
    } else {
      bestand.splice(index, 1); 
    }
    saveBestandToLocalStorage(bestand); 
    renderBestandHtml();
  }
}



