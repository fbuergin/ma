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
    */

    document.getElementById('html5-qrcode-anchor-scan-type-change').classList.add(
      'hover:text-green-600'
    )
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

async function success(result) {
    document.querySelector('.nochmals-scannen-btn').style.display = "block"; 
    
    scanner.clear();
    document.getElementById('reader').remove();
    let neuesVerbrauchtesProdukt = await fetchProductData(result); 
    addToVerbrauch(neuesVerbrauchtesProdukt);
    renderVerbrauchHTML();


}

document.querySelector('.scanning-btn').addEventListener('click', () => {
  scanProdukt();
})

/*
document.querySelector('.scanning-btn').addEventListener('click', async () => {
  let produkt = await fetchProductData('4103990020006'); 
  console.log(produkt);
  addToVerbrauch(produkt);
  renderVerbrauchHTML();
});
*/



function renderVerbrauchHTML() {
  const verbrauchContainer = document.querySelector('.verbrauch-produkte-container');
  verbrauchContainer.innerHTML = '';

  verbrauch.forEach(produkt => {
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
      const produkt = verbrauch.find(p => p.barcode === produktCode);
      addToVerbrauch(produkt);
    });

    let intervalId;
    let timeoutId;

    plusButton.addEventListener('mousedown', (event) => {
      const produktCode = event.target.dataset.produktCode;
      const produkt = verbrauch.find(p => p.barcode === produktCode);
      addToVerbrauch(produkt);
      timeoutId = setTimeout(function() {
        intervalId = setInterval(function() {
          addToVerbrauch(produkt);
        }, 100); 
      }, 700); 
    });

    buttonContainer.appendChild(plusButton);

    const minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.dataset.produktCode = produkt.barcode;
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
      const produkt = verbrauch.find(p => p.barcode === produktCode);
      removeFromVerbrauch(produkt);
    });

    minusButton.addEventListener('mousedown', (event) => {
      const produktCode = event.target.dataset.produktCode;
      const produkt = verbrauch.find(p => p.barcode === produktCode);
      removeFromVerbrauch(produkt);
      timeoutId = setTimeout(function() {
        intervalId = setInterval(function() {
          removeFromVerbrauch(produkt);
        }, 100); 
      }, 700); 
    });

    buttonContainer.appendChild(minusButton);

    document.addEventListener('mouseup', function(event) {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    });

    produktContainer.appendChild(buttonContainer);
    verbrauchContainer.appendChild(produktContainer);
  });
}

function addToVerbrauch(produkt) {
  const vorhandenesProdukt = verbrauch.find(p => p.description === produkt.description) || verbrauch.find(p => p.title === produkt.title) || verbrauch.find(p => p.description === produkt.title) || verbrauch.find(p => p.title === produkt.description);
  if (vorhandenesProdukt) {
    vorhandenesProdukt.menge++;
  } else {
    verbrauch.push(produkt);
    produkt.menge = 1;
  }
  saveVerbrauchToLocalStorage();
  renderVerbrauchHTML();
}

function removeFromVerbrauch(produkt) {
  const vorhandenesProdukt = verbrauch.find(p => p.description === produkt.description) || verbrauch.find(p => p.title === produkt.title) || verbrauch.find(p => p.description === produkt.title) || verbrauch.find(p => p.title === produkt.description);

  if (vorhandenesProdukt) {
    const index = verbrauch.indexOf(vorhandenesProdukt);
    if (verbrauch[index].menge > 1) {
      verbrauch[index].menge--;
    } else {
      verbrauch.splice(index, 1);
    }
    saveVerbrauchToLocalStorage();
    renderVerbrauchHTML();
  }
}
