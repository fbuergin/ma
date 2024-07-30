import { fetchProductData, error } from "./databaseConnection.js";

let verbrauch = [];

// Laden des verbrauchs aus dem Local Storage
function loadVerbrauchFromLocalStorage() {
  const verbrauchData = localStorage.getItem('verbrauch');
  if (verbrauchData) {
    verbrauch = JSON.parse(verbrauchData);
  } else {
    verbrauch = [{
      description: 'apfel',
      menge: 1,
      barcode:'002'
    }, {
      description: 'birne',
      menge: 1,
      barcode:'003'
    }];
    saveVerbrauchToLocalStorage();
  }
}

window.onload = function() {
  loadVerbrauchFromLocalStorage();
  renderVerbrauchHTML();
}

// Speichern des verbrauchs im Local Storage
function saveVerbrauchToLocalStorage() {
  localStorage.setItem('verbrauch', JSON.stringify(verbrauch));
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
    document.querySelector('.verbrauch-produkte-container').classList.remove('flex')
    document.querySelector('.scanning-btn-container').classList.add('hidden')
    document.querySelector('.verbrauch-produkte-container').classList.add('hidden')
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

}


/*
//damit ich nicht qr-scanner verwenden muss weil schlechte kamera auf computer
document.querySelector('.scanning-btn').addEventListener('click', () => {
  getProduktData('7610057030054');
});
*/


let neuesVerbrauchtesProdukt = '';


async function getProduktData(result) {
  try {
    let upcCode = result;
    neuesVerbrauchtesProdukt = await fetchProductData(upcCode); 
    addToVerbrauch(neuesVerbrauchtesProdukt);
    renderVerbrauchHTML();


  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
   
  }
}



function renderVerbrauchHTML() {
  const verbrauchContainer = document.querySelector('.verbrauch-produkte-container');
  verbrauchContainer.innerHTML = '';

  verbrauch.forEach(produkt => {
    const produktContainer = document.createElement('div');
    produktContainer.classList.add(
      'produkt-container', 
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
    //produktContainer.style.borderRadius = '10px';

    console.log(produktContainer)


    const produktNameDiv = document.createElement('div');
    produktNameDiv.classList.add(
      'produkt-name',
      'basis-1/4',
    );
    produktNameDiv.textContent = produkt.description || produkt.title || produkt.barcode;
    produktContainer.appendChild(produktNameDiv);

    const mengeDiv = document.createElement('div');
    mengeDiv.classList.add(
      'produkt-menge',
      'basis-1/4'
    );
    mengeDiv.textContent = produkt.menge;
    produktContainer.appendChild(mengeDiv);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add(
      'button-container',
      'basis-1/2',


    );

    const plusButton = document.createElement('button');
    plusButton.classList.add(
      'plus-btn',
      'bg-green-400',
      'hover:bg-green-600',
      'h-9',
      'w-9',
      'rounded-full',
      'mr-2'
    );
    plusButton.textContent = '+';
    plusButton.dataset.produktCode = produkt.barcode;
    buttonContainer.appendChild(plusButton);

    const minusButton = document.createElement('button');
    minusButton.classList.add(
      'minus-btn',
      'bg-green-400',
      'hover:bg-green-600',
      'h-9',
      'w-9',
      'rounded-full',
    );
    minusButton.textContent = '-';
    minusButton.dataset.produktCode = produkt.barcode;
    buttonContainer.appendChild(minusButton);

    produktContainer.appendChild(buttonContainer);

    verbrauchContainer.appendChild(produktContainer);
  });
}


function addToVerbrauch(neuesVerbrauchtesProdukt) {
  const vorhandenesProdukt = verbrauch.find(produkt => produkt.barcode === neuesVerbrauchtesProdukt.barcode);

  if (vorhandenesProdukt) {
    vorhandenesProdukt.menge++;
  } else {
    verbrauch.push(neuesVerbrauchtesProdukt);
    neuesVerbrauchtesProdukt.menge = 1;

  }
  saveVerbrauchToLocalStorage();
  renderVerbrauchHTML(); 
}

function removeFromverbrauch(produktCode) {
  const index = verbrauch.findIndex(produkt => produkt.barcode === produktCode);
  
  if (index !== -1) {
    if (verbrauch[index].menge > 1) {
      verbrauch[index].menge--;
    } else {
      verbrauch.splice(index, 1); 
    }

    saveVerbrauchToLocalStorage(); 
    renderVerbrauchHTML();
  }
}

/*
//plus und minus btn
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('plus-btn')) {
    const produktName = event.target.dataset.produkt;
    addToVerbrauch({description: produktName});
  }
});

document.addEventListener('click', function(event) {
  if (event.target.classList.contains('minus-btn')) {
    const produktName = event.target.dataset.produkt;
    removeFromverbrauch(produktName);
  }
});
*/

//plus minus btn (upgrade)
let intervalId;
let timeoutId;

document.addEventListener('mousedown', function(event) {
  if (event.target.classList.contains('plus-btn')) {
    const produktCode = event.target.dataset.produktCode;
    addToVerbrauch({barcode: produktCode});
    timeoutId = setTimeout(function() {
      intervalId = setInterval(function() {
        addToVerbrauch({barcode: produktCode});
      }, 100); 
    }, 700); 
  } else if (event.target.classList.contains('minus-btn')) {
    const produktCode = event.target.dataset.produktCode;
    removeFromverbrauch(produktCode);
    timeoutId = setTimeout(function() {
      intervalId = setInterval(function() {
        removeFromverbrauch(produktCode);
      }, 100); 
    }, 700); 
  }
});

document.addEventListener('mouseup', function(event) {
  clearInterval(intervalId);
  clearTimeout(timeoutId);
});


