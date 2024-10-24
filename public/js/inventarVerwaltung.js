import { fetchProductData, error } from "../../api/fetchProductData.js";
import {  vergleicheEigenschaften, vergleicheUnterschiedlicheEigenschaften, formatiereString, quaggaInit, detectCode } from "./utils.js";
import { detectLanguage, fetchTranslation } from "../../api/googleTranslation.js";

class InventarVerwaltung {
  verarbeitetBarcode = false; 

  constructor(inventarTyp) {
    this.inventarTyp = inventarTyp; 
    this.inventar = [];

    window.onload = () => {
      this.loadInventarFromLocalStorage();
      this.renderInventarHTML();

    };
  }

  // Laden des Inventars aus dem Local Storage
  loadInventarFromLocalStorage() {
    const inventarData = localStorage.getItem(this.inventarTyp);
    if (inventarData) {
      this.inventar = JSON.parse(inventarData);
    } else {
      this.inventar = [{
        description: 'apfel',
        menge: 1,
        barcode: '002'
      }, {
        description: 'birne',
        menge: 1,
        barcode: '003'
      }];
      this.saveInventarToLocalStorage();
    }
  }

  // Speichern des Inventars im Local Storage
  saveInventarToLocalStorage() {
    localStorage.setItem(this.inventarTyp, JSON.stringify(this.inventar));
  }


  renderInventarHTML() {
    const inventarContainer = document.querySelector('.inventar-produkte-container');
    inventarContainer.innerHTML = '';

  
    this.inventar.forEach(produkt => {
      const produktContainer = document.createElement('div');
      produktContainer.classList.add(
        'produkt-container',
        `produkt-container-${produkt.barcode}`,
        'flex',
        'items-center',
        'w-full',
        'justify-center',
        'rounded-lg',
        'p-3',
        'm-2',
        'shadow-md',
        'bg-c2',
        'h-auto'
      );

      const produktNameDiv = document.createElement('div');
      produktNameDiv.textContent = formatiereString(produkt.description) || formatiereString(produkt.title) || formatiereString(produkt.barcode);
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
        'flex',
        'items-center',
      );

      const plusButton = document.createElement('button');
      plusButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#000000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>`;
      plusButton.dataset.produktCode = produkt.barcode;
      plusButton.classList.add(
        'plus-btn',
        'flex',
        'items-center',
        'justify-center',
        'bg-green-400',
        'hover:bg-green-600',
        'h-8',
        'w-8',
        'rounded-full',
        'mr-2'
      );
      buttonContainer.appendChild(plusButton);

      const minusButton = document.createElement('button');
      minusButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#000000"><path d="M232-444v-72h496v72H232Z"/></svg>`;
      minusButton.dataset.produktCode = produkt.barcode;
      minusButton.classList.add(
        'minus-btn',
        'flex',
        'items-center',
        'justify-center',
        'bg-green-400',
        'hover:bg-green-600',
        'h-8',
        'w-8',
        'rounded-full',
      );
      buttonContainer.appendChild(minusButton);

      produktContainer.appendChild(buttonContainer);
      inventarContainer.appendChild(produktContainer);


      const verbrauchAnzeigeContainer = document.createElement('div');
      verbrauchAnzeigeContainer.dataset.produktCode = produkt.barcode;

      const verbrauchAnzeigeParagraph = document.createElement('p');

    });
    this.addEventListeners();
  }

  verbleibenderVerbrauch(produkt) {
    const menupläne = getMenuPläneFromLocalStorage();
    menupläne.forEach((menuplan) => {
      menuplan.forEach((menu) => {

      })
    })
  }

 

  async addToInventar(produkt) {
    const sprache = await detectLanguage(produkt.description || produkt.title)

    if (sprache !== 'de') {
      const translationData = await fetchTranslation(produkt.description || produkt.title, 'de');
      produkt.description = translationData.translations[0]?.toLowerCase();  
      produkt.title = translationData.translations[0]?.toLowerCase();  
    }

    console.log(produkt)
    const vorhandenesProdukt = this.inventar.find(p =>
      vergleicheEigenschaften(p, produkt, 'description') ||
      vergleicheEigenschaften(p, produkt, 'title') ||
      vergleicheUnterschiedlicheEigenschaften(p, produkt, 'description', 'title') ||
      vergleicheUnterschiedlicheEigenschaften(p, produkt, 'title', 'description')
    );
    if (vorhandenesProdukt) {
      vorhandenesProdukt.menge++;
    } else {
      produkt.menge = 1;
      this.inventar.push(produkt);
    }
    this.saveInventarToLocalStorage();
    this.renderInventarHTML();
  }

  removeFromInventar(produkt) {
    const vorhandenesProdukt = this.inventar.find(p =>
      vergleicheEigenschaften(p, produkt, 'description') ||
      vergleicheEigenschaften(p, produkt, 'title') ||
      vergleicheUnterschiedlicheEigenschaften(p, produkt, 'description', 'title') ||
      vergleicheUnterschiedlicheEigenschaften(p, produkt, 'title', 'description')
    );

    if (vorhandenesProdukt) {
      const index = this.inventar.indexOf(vorhandenesProdukt);
      if (this.inventar[index].menge > 1) {
        this.inventar[index].menge--;
      } else if (this.inventar[index].menge < 0) {
        this.inventar[index].menge++;
      } else {
        this.inventar.splice(index, 1);
      }
      this.saveInventarToLocalStorage();
      this.renderInventarHTML();
    }
  }

  addEventListeners() {
  
 
    document.querySelector('.test-btn').addEventListener('click', (event) => {
      console.log(this.inventar)
    });
    

    let intervalId;
    let timeoutId;

    document.querySelectorAll('.plus-btn').forEach(button => {
    
      button.addEventListener('click', async (event) => {
        let node = event.target;
        while (node.nodeName.toLowerCase() !== 'button') {
          node = node.parentNode;
        }
        const produktCode = node.dataset.produktCode;
        console.log(event.target)
        const produkt = this.inventar.find(p => p.barcode === produktCode);
        await this.addToInventar(produkt);
      });
/*
      button.addEventListener('mousedown', async (event) => {
        let node = event.target;
        while (node.nodeName.toLowerCase() !== 'button') {
          node = node.parentNode;
        }
        const produktCode = node.dataset.produktCode;
        const produkt = this.inventar.find(p => p.barcode === produktCode);
        await this.addToInventar(produkt);

        timeoutId = setTimeout(() => {
          intervalId = setInterval(async () => {
            await this.addToInventar(produkt);
          }, 100);
        }, 700);
      });

      button.addEventListener('mouseup', () => {
        clearTimeout(timeoutId); 
        clearInterval(intervalId);  
        timeoutId = null;  
        intervalId = null;
      });
*/
    });

    document.querySelectorAll('.minus-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        let node = event.target;
        while (node.nodeName.toLowerCase() !== 'button') {
          node = node.parentNode;
        }
        const produktCode = node.dataset.produktCode;
        const produkt = this.inventar.find(p => p.barcode === produktCode);
        this.removeFromInventar(produkt);
      });
/*
      button.addEventListener('mousedown', (event) => {
        let node = event.target;
        while (node.nodeName.toLowerCase() !== 'button') {
          node = node.parentNode;
        }
        const produktCode = node.dataset.produktCode;
        const produkt = this.inventar.find(p => p.barcode === produktCode);
        this.removeFromInventar(produkt);
        timeoutId = setTimeout(() => {
          intervalId = setInterval(() => {
            this.removeFromInventar(produkt);
          }, 100);
        }, 700);
      });

      button.addEventListener('mouseup', () => {
        clearTimeout(timeoutId);  
        clearInterval(intervalId);  
        timeoutId = null;  
        intervalId = null; 
      });
  */

    });

    document.querySelector('.scanning-btn').addEventListener('click', async () => {
      document.querySelector('.inventar-produkte-container').classList.remove('flex');
      document.querySelector('.inventar-produkte-container').classList.add('hidden');
      document.querySelector('.scanning-btn-container').classList.remove('flex');
      document.querySelector('.scanning-btn-container').classList.add('hidden');
      document.querySelector('.container').classList.remove('hidden');
      document.querySelector('.container').classList.add('flex');

      quaggaInit(this.verarbeitetBarcode);

      try {
        const code = await detectCode(this.verarbeitetBarcode);
        console.log("Detected code:", code);

        this.verarbeitetBarcode = true; 
    
        const data = await fetchProductData(Number(code));
        await this.addToInventar(data);

        this.verarbeitetBarcode = false;
    

      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        Swal.fire({
          title: "Fehler",
          text: `Es ist ein Fehler aufgetreten, Fehler: ${error.message}`,
          icon: "error",
        });
      } finally {
        document.querySelector('.inventar-produkte-container').classList.remove('hidden');
        document.querySelector('.inventar-produkte-container').classList.add('flex');
        document.querySelector('.scanning-btn-container').classList.remove('hidden');
        document.querySelector('.scanning-btn-container').classList.add('flex');
        document.querySelector('.container').classList.remove('flex');
        document.querySelector('.container').classList.add('hidden');
      }
    });
  }
}


class Verbrauch extends InventarVerwaltung {
  loadBestandFromLocalStorage() {
    let bestand = [];
    const inventarData = localStorage.getItem('bestand');
    if (inventarData) {
      bestand = JSON.parse(inventarData);
    } else {
      bestand = [];
    }
    return bestand;
  }


  saveBestandToLocalStorage(bestand) {
    localStorage.setItem('bestand', JSON.stringify(bestand));
  }



  erstelleaktualisierterBestand() {
    let bestand = this.loadBestandFromLocalStorage();
    console.log(bestand)
    let verbrauch = this.inventar;
    let aktualisierterBestand = [];

    
    bestand.forEach((bestandsItem) => {
      let gefundenInVerbrauch = verbrauch.find(verbrauchsItem => 
        vergleicheEigenschaften(verbrauchsItem, bestandsItem, 'description') ||
        vergleicheEigenschaften(verbrauchsItem, bestandsItem, 'title') ||
        vergleicheUnterschiedlicheEigenschaften(verbrauchsItem, bestandsItem, 'description', 'title') ||
        vergleicheUnterschiedlicheEigenschaften(verbrauchsItem, bestandsItem, 'title', 'description')
      ); 
      if (gefundenInVerbrauch) {
        let neueMenge = bestandsItem.menge - gefundenInVerbrauch.menge;
        bestandsItem = { ...bestandsItem, menge: neueMenge };
      }
      aktualisierterBestand.push(bestandsItem);
    });
  
    //wenn das produkt noch nicht im Vorrat ist dann soll die gesamte Verbrauchte Menge zugefügt werden
    verbrauch.forEach((verbrauchsItem) => {
      let gefundenInBestand = bestand.find(bestandsItem => 
        vergleicheEigenschaften(bestandsItem, verbrauchsItem, 'description') ||
        vergleicheEigenschaften(bestandsItem, verbrauchsItem, 'title') ||
        vergleicheUnterschiedlicheEigenschaften(bestandsItem, verbrauchsItem, 'description', 'title') ||
        vergleicheUnterschiedlicheEigenschaften(bestandsItem, verbrauchsItem, 'title', 'description')
      );
      

      if (!gefundenInBestand) {
        let neueMenge = verbrauchsItem.menge * -1;
        console.log('aeg')
        let newItem = { ...verbrauchsItem, menge: neueMenge };
        aktualisierterBestand.push(newItem);
      }
    });
    
    return aktualisierterBestand;
  }

  updateBestand() {
    let aktualisierterBestand = this.erstelleaktualisierterBestand();
    let bestand = this.loadBestandFromLocalStorage();

    bestand = aktualisierterBestand;
    this.saveBestandToLocalStorage(bestand);
    this.inventar = [];
    this.saveInventarToLocalStorage();
    this.renderInventarHTML();
  }

  addEventListeners() {
    super.addEventListeners();
    const saveVerbrauchBtn = document.querySelector('.save-verbrauch-btn');
    saveVerbrauchBtn.addEventListener('click', () => {
      this.updateBestand();
    })
  }
}


export { InventarVerwaltung, Verbrauch }