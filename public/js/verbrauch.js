import { fetchProductData, error } from "./databaseConnection.js";

let verbrauch = [];

// Laden des verbrauchs aus dem Local Storage
function loadVerbrauchFromLocalStorage() {
  const verbrauchData = localStorage.getItem('verbrauch');
  if (verbrauchData) {
    verbrauch = JSON.parse(verbrauchData);
  } else {
    verbrauch = [{
      description: 'tomate',
      menge: 1,
      barcode:'100'
    }, {
      description: 'birne',
      menge: 2,
      barcode:'102'
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
    scanner = true; 
    initializeScanner();
    document.querySelector('.scanning-btn').remove();
    console.log('Scanner gestartet');
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



//damit ich nicht qr-scanner verwenden muss weil schlechte kamera auf computer
document.querySelector('.scanning-btn').addEventListener('click', () => {
  getProduktData('7610057030054');
});



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
  const tableBody = document.querySelector('#verbrauchTable tbody');
  tableBody.innerHTML = '';

 
  verbrauch.forEach(produkt => {
    const row = document.createElement('tr');
    let produktName = '';

    if (produkt.description) {
      produktName = produkt.description;
    } else if (produkt.description === ''){
      produktName = produkt.title;
    } else if (produkt.title === '') {
      produktName = produkt.barcode;
    } else {
      return;
    }


    const produktNameCell = document.createElement('td');
    produktNameCell.textContent = produktName;
    row.appendChild(produktNameCell);

    const quantityCell = document.createElement('td');
    quantityCell.textContent = produkt.menge;
    row.appendChild(quantityCell);

    const addButtonCell = document.createElement('td');
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.dataset.produktCode = produkt.barcode; 
    addButton.classList.add('plus-btn');
    addButtonCell.appendChild(addButton);
    row.appendChild(addButtonCell);

    const removeButtonCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.textContent = '-';
    removeButton.dataset.produktCode = produkt.barcode; 
    removeButton.classList.add('minus-btn'); 
    removeButtonCell.appendChild(removeButton);
    row.appendChild(removeButtonCell);

    tableBody.appendChild(row);
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


