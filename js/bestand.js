import { fetchProductData, error } from "../node/databaseConnection.js";

let bestand = [{
  description: 'tomate',
  menge: 1
}, {
  description: 'apfel',
  menge: 2
}
]

window.onload = function() {
  loadBestandFromLocalStorage();
  renderBestandHtml();
}

// Speichern des Bestands im Local Storage
function saveBestandToLocalStorage() {
  localStorage.setItem('bestand', JSON.stringify(bestand));
}

// Laden des Bestands aus dem Local Storage
function loadBestandFromLocalStorage() {
  const bestandData = localStorage.getItem('bestand');
  if (bestandData) {
    bestand = JSON.parse(bestandData);
  } else {
    let bestand = [{
      description: 'tomate',
      menge: 2
    }, {
      description: 'apfel',
      menge: 1
    }];
  }
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
    document.getElementById('result').innerHTML = `
    <h2>Erfolgreich gescannt</h2>
    <p><a href="${result}">${result}</a></p>
    <br><br>
    <a href="index.html">Nochmal scannen</a>
    `;
    
    scanner.clear();
    document.getElementById('reader').remove();
    getProduktData(result);
}


/*
//damit ich nicht qr-scanner verwenden muss weil schlechte kamera auf computer
document.querySelector('.scanning-btn').addEventListener('click', () => {
  getProduktData('4005808705481');
});
*/


let neuesProdukt = '';


async function getProduktData(result) {
  try {
    let upcCode = result;
    neuesProdukt = await fetchProductData(upcCode); 
    addToBestand(neuesProdukt);
    renderBestandHtml();
    console.log(bestand);


  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  }
}


function renderBestandHtml() {
  const tableBody = document.querySelector('#bestandTable tbody');
  tableBody.innerHTML = '';

  bestand.forEach(produkt => {
    const row = document.createElement('tr');

    const produktNameCell = document.createElement('td');
    produktNameCell.textContent = produkt.description;
    row.appendChild(produktNameCell);

    const quantityCell = document.createElement('td');
    quantityCell.textContent = produkt.menge;
    row.appendChild(quantityCell);

    const addButtonCell = document.createElement('td');
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.dataset.produkt = produkt.description; 
    addButton.classList.add('plus-btn');
    addButtonCell.appendChild(addButton);
    row.appendChild(addButtonCell);

    const removeButtonCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.textContent = '-';
    removeButton.dataset.produkt = produkt.description; 
    removeButton.classList.add('minus-btn'); 
    removeButtonCell.appendChild(removeButton);
    row.appendChild(removeButtonCell);

    tableBody.appendChild(row);
  });
}


function addToBestand(neuesProdukt) {
  const vorhandenesProdukt = bestand.find(produkt => produkt.description === neuesProdukt.description);
  
  if (vorhandenesProdukt) {
    vorhandenesProdukt.menge++;
  } else {
    bestand.push(neuesProdukt);
    neuesProdukt.menge = 1;
  }
  saveBestandToLocalStorage();
  renderBestandHtml(); 
}

function removeFromBestand(description) {
  const index = bestand.findIndex(produkt => produkt.description === description);
  
  if (index !== -1) {
    if (bestand[index].menge > 1) {
      bestand[index].menge--;
    } else {
      bestand.splice(index, 1); 
    }

    saveBestandToLocalStorage(); 
    renderBestandHtml();
  }
}

/*
//plus und minus btn
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('plus-btn')) {
    const produktName = event.target.dataset.produkt;
    addToBestand({description: produktName});
  }
});

document.addEventListener('click', function(event) {
  if (event.target.classList.contains('minus-btn')) {
    const produktName = event.target.dataset.produkt;
    removeFromBestand(produktName);
  }
});
*/

//plus minus btn (upgrade)
let intervalId;
let timeoutId;

document.addEventListener('mousedown', function(event) {
  if (event.target.classList.contains('plus-btn')) {
    const produktName = event.target.dataset.produkt;
    addToBestand({description: produktName});
    timeoutId = setTimeout(function() {
      intervalId = setInterval(function() {
        addToBestand({description: produktName});
      }, 100); 
    }, 700); 
  } else if (event.target.classList.contains('minus-btn')) {
    const produktName = event.target.dataset.produkt;
    removeFromBestand(produktName);
    timeoutId = setTimeout(function() {
      intervalId = setInterval(function() {
        removeFromBestand(produktName);
      }, 100); 
    }, 700); 
  }
});

document.addEventListener('mouseup', function(event) {
  clearInterval(intervalId);
  clearTimeout(timeoutId);
});






