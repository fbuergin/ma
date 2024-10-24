import { fetchSynonyms } from '../../api/fetchSynonyms.js';
import { fetchTranslation, detectLanguage } from '../../api/googleTranslation.js';
import { fetchProductData, error } from '../../api/fetchProductData.js';
import { formatiereString, vergleicheEigenschaften, vergleicheUnterschiedlicheEigenschaften, generiereId, detectCode, quaggaInit } from './utils.js';
import { provEinkaufsliste } from './einkaufsliste-provisorisch.js';


class Einkaufsliste {
  verarbeitetBarcode = false; 

  constructor() {
    window.onload = () => {
      this.getEinkaufslisteFromLocalStorage();
      this.renderEinkaufslisteHTML();
      this.saveEinkaufslisteToLocalStorage();
    }
  };


  loadBestandFromLocalStorage() {
    const bestandData = localStorage.getItem('bestand');
    let bestand = [];
    if (bestandData) {
      bestand = JSON.parse(bestandData);
    } else {
      bestand = [{
        description: 'apfel',
        menge: 1,
        barcode: '002'
      }, {
        description: 'birne',
        menge: 1,
        barcode: '003'
      }];
      this.saveBestandToLocalStorage(bestand);
    }
    return bestand
  }

  // Speichern des Inventars im Local Storage
  saveBestandToLocalStorage(bestand) {
    localStorage.setItem('bestand', JSON.stringify(bestand));
  }

  getEinkaufslisteFromLocalStorage() {
    const data = localStorage.getItem('einkaufsliste');
    console.log(data)
    if (data) {
      this.einkaufsliste = JSON.parse(data);
    } else {
      //this.einkaufsliste = erstelleEinkaufsliste();
      this.einkaufsliste = this.erstelleEinkaufsliste();
    }
    console.log(einkaufsliste)
    //return einkaufsliste
  }

 
  saveEinkaufslisteToLocalStorage() {
    localStorage.setItem('einkaufsliste', JSON.stringify(this.einkaufsliste))
  }


  loadProvEinkaufslisteFromLocalStorage() {
    let provEinkaufsliste = {}
    const gespeicherteListe = localStorage.getItem('provEinkaufsliste');
    //nicht !gespeicherteListe da es ein object null herausgibt und so speziell behandelt werden muss
    if(gespeicherteListe !== null && gespeicherteListe !== undefined) {
      provEinkaufsliste  = JSON.parse(gespeicherteListe);
  
    } else {
      provEinkaufsliste = {
        gleicheProdukte: [],
        nichtGefundeneProdukte: [],
        ähnlicheProdukte: {
          original: [],
          umgewandelteProdukte: []
        }
      };
    }
    return provEinkaufsliste;
  }



  async scannProdukt() {
    console.log('sacnn procuct')
    document.querySelector('.einkaufsliste-container').classList.remove('flex')
    document.querySelector('.einkaufsliste-container').classList.add('hidden')
    document.querySelector('.container').classList.remove('hidden')
    document.querySelector('.container').classList.add('flex');
    // Startet den Barcode Scanner nach einem kleinen Timeout
    quaggaInit(this.verarbeitetBarcode);

    try {
      const code = await detectCode(this.verarbeitetBarcode);
      console.log("Detected code:", code);
      const data = await fetchProductData(Number(code));
      return data;

    } catch (error) {
      console.error("Fehler beim Scannen des Codes:", error);
      Swal.fire({
        title: "Fehler",
        text: `Es ist ein Fehler aufgetreten, Fehler: ${error.message}`,
        icon: "error",
      });
    } finally {
      document.querySelector('.container').classList.remove('flex');
      document.querySelector('.container').classList.add('hidden')
      document.querySelector('.einkaufsliste-container').classList.remove('hidden')
      document.querySelector('.einkaufsliste-container').classList.add('flex')
    }
  }


  //Zwischen array ungeordneteProvEinkaufsliste wird erstellt, damit dann die produkte besser abgefragt werden können.
  //von ungeordneteProvEinkaufsliste wird dann bereinigteProvEinkaufliste erstellt.
  //gecheckt ob es mehrere gleiche produkte in der einkufsliste hat, damit von diesen dann die menuMenge zusammengezählt werden können. 
  bereinigeProvEinkaufsliste() {
    let provEinkaufsliste = this.loadProvEinkaufslisteFromLocalStorage();
    let ungeordneteProvEinkaufsliste = [];
    let bereinigteProvEinkaufsliste = [];
    console.log(provEinkaufsliste)
    
    Object.values(provEinkaufsliste).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((p) => {
          ungeordneteProvEinkaufsliste.push(p);
        })
      } else {
        Object.values(value).forEach((v) => {
          v.forEach((produkt) => {
            ungeordneteProvEinkaufsliste.push(produkt);
          })
        })
      }
    })

    ungeordneteProvEinkaufsliste.forEach((p) => {
        //prüfen dass das produkt noch nicht in bereinigteProvEinkaufsliste ist, damit es nicht mehrfach aufgenommen wird.    
      let produktBereitsVorhanden = bereinigteProvEinkaufsliste.some((o) => {
        return Object.values(o)[0].some((gleichesProdukt) => {
          return gleichesProdukt.einkaufslisteName === p.einkaufslisteName
        })
      })

      if (!produktBereitsVorhanden) {
        let gleicheProdukte = ungeordneteProvEinkaufsliste.filter((produkt) => {
          return p.einkaufslisteName === produkt.einkaufslisteName;
        })
    
        let menuMengeTot = 0;
        gleicheProdukte.forEach((p) => {
          menuMengeTot += Number(p.menuMenge)
        })
        bereinigteProvEinkaufsliste.push({ [p.einkaufslisteName]: gleicheProdukte, 'menuMengeTot': menuMengeTot});
      }
    })
    return bereinigteProvEinkaufsliste;
  }
      

  //bereinigteProvEk wird durchgegegangen und die menuMengeTot wird der bestands.menge abgezogen um die einkaufsmenge zu erstellen
  erstelleEinkaufsliste() {
    let bereinigteProvEinkaufsliste = this.bereinigeProvEinkaufsliste();
    let bestand = this.loadBestandFromLocalStorage();
    let einkaufsliste = [] //getEinkaufslisteFromLocalStorage();
    let produktInBestand;
    console.log(bereinigteProvEinkaufsliste)

    bereinigteProvEinkaufsliste.forEach((p) => {
      const object = p[Object.keys(p)[0]][0];


      produktInBestand = bestand.find((produkt) => {
        console.log(produkt)
        console.log(object['einkaufslisteName'])
        return vergleicheUnterschiedlicheEigenschaften(produkt, object, 'description', 'einkaufslisteName') ||
          vergleicheUnterschiedlicheEigenschaften(produkt, object, 'title', 'einkaufslisteName');
      })

      console.log(produktInBestand)


      if (produktInBestand) {
        let neueMenge = produktInBestand.menge - p.menuMengeTot;
        //wenn die menge grösser oder 0 ist wird es nicht zu einkaufsliste zugefügt
        if (!neueMenge >= 0) {
          let einkaufsMenge = neueMenge * -1;
          einkaufsliste.push({'id': Object.values(p)[0][0].id , 'produktName': formatiereString(Object.keys(p)[0]), 'neueMenge': neueMenge, 'einkaufsMenge': einkaufsMenge})
        }
      } else {
        einkaufsliste.push({'id': Object.values(p)[0][0].id ,'produktName': formatiereString(Object.keys(p)[0]), 'einkaufsMenge': p.menuMengeTot})
      }
    })
    console.log(JSON.parse(localStorage.getItem('provEinkaufsliste')))
    localStorage.removeItem('provEinkaufsliste')
    return einkaufsliste;
  }



  async erstelleÄhnlicheProdukte(produktName) {
    try {
      const sprache = await detectLanguage(produktName);

      let übersetzung;
      if (sprache !== 'de') {
        const translationData = await fetchTranslation(produktName, 'de');
        übersetzung = translationData.translations[0]?.toLowerCase() || produktName;          
      } else {
        übersetzung = produktName;
      }

      const übersetzungSynonyme = await fetchSynonyms(übersetzung);
      const produktSynonyme = await fetchSynonyms(produktName);
      const alleSynonyme = [...new Set([...übersetzungSynonyme, ...produktSynonyme])];


      console.log(`
        produktname lautet: '${produktName}'; 
        übersetzung lautet: '${übersetzung}'; 
        synonyme lauten: '${alleSynonyme}'
      `)
      let ähnlicheProdukte = {
        produktName,
        übersetzung,
        alleSynonyme
      }
      return ähnlicheProdukte;

    } catch (error) {
      console.error('Fehler beim Abrufen von Synonymen:', error);
    }
    /*
    let ähnlicheProdukte = {
      produktName: '',
      übersetzung: '',
      alleSynonyme: []
    };
    */
    return ähnlicheProdukte;
  }

  //check ob das resultat (rückgabewert des eingescannten produktes) gleich dem Produkt in der Einkaufsliste ist. 
  //wird auch wieder ähnlicheProdukte erstellt umd zu prüfen ob das resultat allenfalls ein ähnlichesProdukt des einkaufsProduktes ist.
  async checkeGültigkeit(einkaufsProdukt, result) {
    let ähnlicheProdukte = await this.erstelleÄhnlicheProdukte(result.description ||  result.title);
    console.log(einkaufsProdukt)
    let einkaufsProduktName = einkaufsProdukt.produktName.toLowerCase();
    let ähnlichesProdukt;

    let gleichesProdukt = (Object.values(ähnlicheProdukte)[0].toLowerCase() === einkaufsProduktName) ? true : false;
    let gleichesÜbersetzungsProdukt = (Object.values(ähnlicheProdukte)[1].toLowerCase() === einkaufsProduktName) ? true : false;

    Object.values(ähnlicheProdukte)[2].forEach((synonym) => {
      ähnlichesProdukt = (synonym.toLowerCase() === einkaufsProduktName) ? true : false;
    })
    
    let istGültig = (ähnlichesProdukt || gleichesProdukt || gleichesÜbersetzungsProdukt) ? true : false;
    return istGültig;
  }


  //check ob die Menge die eingegeben wurde mit der menge übereinstimmt die in der einkaufsliste angegeben ist. 
  //auch möglich die Menge zu überschreiben.
  async produktMengeCheck(istÜberschrieben, einkaufsProdukt, result) {
    //istÜberschrieben = false;
    console.log(istÜberschrieben)
    const inputValue = '';
    const { value: menge } = await Swal.fire({
      title: "Prüfung der Stückanzahl",
      input: "text",
      html: `Wie viele Stück von <b>${einkaufsProdukt.produktName}</b> haben Sie im Einkaufskorb`,
      inputValue,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Sie müssen eine Anzahl angeben!";
        } else if (isNaN(value)) {
          return "Sie dürfen keine Buchstaben eingeben, nur Zahlen!"
        } else if (value > 100) {
          return "Geben Sie bitte eine realistische Anzahl an"
        }
      }
    }).then(async(r) => {
      if(r.isConfirmed) {
        let menge = Number(r.value);
        //Wenn Menge nicht stimmt
        if(Number(r.value) !== einkaufsProdukt.einkaufsMenge) {
          Swal.fire({
            title: `Fehler bei der Mengenangabe`,
            html: `<p style="font-size: 16px;">Eingegebene Menge: <b>${menge}</b><br>Erwartete Menge laut Einkaufsliste: <b>${einkaufsProdukt.einkaufsMenge}</b></p>.<br>Möchten Sie die Menge <b>${menge}</b> übernehmen und die Liste aktualisieren oder erneut scannen?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            cancelButtonText: "Nein, Menge ändern",
            confirmButtonText: "Ja, Menge übernehmen"
            
          }).then(async (r) => {
            if (r.isConfirmed) {
              //if (istÜberschrieben) {
              //  this.updateBestand(istÜberschrieben, result, Number(menge));
              //} else {
              await this.updateBestand(istÜberschrieben, {...einkaufsProdukt, 'barcode' : result.barcode}, Number(menge));
              //}
              //updateBestand(istÜberschrieben, einkaufsProdukt, Number(menge))
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Tiptop, Ihr Vorrat wurde erfolgreich aktualisiert",
                showConfirmButton: false,
                timer: 1500
              });
            } else {
              await this.produktMengeCheck(istÜberschrieben, einkaufsProdukt, result)
            }
          })
        } else {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Tiptop, Ihr Vorrat wurde erfolgreich aktualisiert",
            showConfirmButton: false,
            timer: 1500
          });
          //if (istÜberschrieben) {
          //  this.updateBestand(istÜberschrieben, result, Number(menge));
         //} else {
          await this.updateBestand(istÜberschrieben, {...einkaufsProdukt, 'barcode' : result.barcode}, Number(menge));
          //}
        }
      }
    })
  }


  //falls das result nicht mit dem einkaufsprodukt übereinstimmt kann das einkaufsprodukt überschrieben werden.
  überschreibeProdukt(einkaufsProdukt, result) {
    let istÜberschrieben = false;
    Swal.fire({
      title: `Fehler beim einscannen des Produktes`,
      html: `<p style="font-size: 16px;">Das eingescannte Produkt stimmt nicht mit dem Produkt in der Einkaufsliste überein</p><br>Eingescanntes Produkt: <b>${result.description || result.title}</b><br>Einkaufslistenprodukt: <b>${einkaufsProdukt.produktName}</b>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Nein, nochmals scannen",
      confirmButtonText: "Ja, Einkaufslistenprodukt überschreiben"

    }).then(async (r) => {
      if (r.isConfirmed) {
        let vorhandenesEinkaufslisteProdukt = this.einkaufsliste.find(p => 
          vergleicheUnterschiedlicheEigenschaften(p, result, 'produktName', 'description') ||
          vergleicheUnterschiedlicheEigenschaften(p, result, 'produktName', 'title')
        );
        let indexOfProductInEinkaufsliste = this.einkaufsliste.findIndex(p => p.produktName === einkaufsProdukt.produktName);

        console.log(vorhandenesEinkaufslisteProdukt)
        if (vorhandenesEinkaufslisteProdukt) {
          vorhandenesEinkaufslisteProdukt.einkaufsMenge += einkaufsProdukt.einkaufsMenge;
          this.einkaufsliste.splice(indexOfProductInEinkaufsliste, 1);
        } else {
          this.einkaufsliste[indexOfProductInEinkaufsliste] = {id: generiereId(), produktName: result.description || result.title, einkaufsMenge: einkaufsProdukt.einkaufsMenge};
        }

        this.saveEinkaufslisteToLocalStorage(this.einkaufsliste);
        this.renderEinkaufslisteHTML();
      }
    });
  }

  //updateBestand fügt immer das einkaufsProdukt (produkt) dem Bestand zu.
  async updateBestand(istÜberschrieben, produkt, neueMenge) {
    //istÜberschrieben = false;
    const sprache = await detectLanguage(produkt.produktName)

    if (sprache !== 'de') {
      const translationData = await fetchTranslation(produkt.produktName, 'de');
      produkt.produktName = translationData.translations[0]?.toLowerCase();  
    }


    console.log(produkt)
    let bestand = this.loadBestandFromLocalStorage();
    let bestandsProdukt;
    //if (istÜberschrieben) {
    const vorhandenesProduktInBestand = bestand.find((p) => {
      return vergleicheEigenschaften(p, produkt, 'produktName') ||
      vergleicheUnterschiedlicheEigenschaften(p, produkt, 'description', 'prduktName') ||
      vergleicheUnterschiedlicheEigenschaften(p, produkt, 'title', 'produktName') ||
      vergleicheUnterschiedlicheEigenschaften(p, produkt, 'prduktName', 'title') ||
      vergleicheUnterschiedlicheEigenschaften(p, produkt, 'prduktName', 'description')
    });
    console.log(vorhandenesProduktInBestand)

    //falls das Einkaufsprodukt bereits im Bestand ist wird die Menge aktualisiert
    if(vorhandenesProduktInBestand) { 
      vorhandenesProduktInBestand.menge += neueMenge;
      this.saveBestandToLocalStorage(bestand);
    //wenn das Einkaufsprodukt noch nicht im Bestand vorhanden ist wird es dem Bestand neu zugefügt
    } else {
      bestand.push({...produkt, menge: neueMenge, description: produkt.produktName.toLowerCase()});
      this.saveBestandToLocalStorage(bestand);
    }
    console.log(bestand)
    console.log(this.einkaufsliste)

    //wenn produkt dem Bestand zugefügt wurde kann es von der einkaufsliste gelöscht werden
    let index = this.einkaufsliste.findIndex(p => p.produktName === produkt.produktName);
    this.einkaufsliste.splice(index, 1);
    this.saveEinkaufslisteToLocalStorage();
    console.log(this.einkaufsliste)
    this.renderEinkaufslisteHTML()
  }



  renderEinkaufslisteHTML() {
    const einkaufslisteContainer = document.querySelector('.einkaufsliste-container');
    einkaufslisteContainer.innerHTML = '';

    if (this.einkaufsliste.length === 0) {
      this.renderLeereEinkaufsliste(einkaufslisteContainer);
    } else {
      this.einkaufsliste.forEach(produkt => {
        if (produkt.produktName && produkt.einkaufsMenge !== 0) {
          this.renderProdukt(produkt, einkaufslisteContainer);
        }
      });
    }
    this.saveEinkaufslisteToLocalStorage()
    this.addEventListeners();
  }

  renderLeereEinkaufsliste(container) {
    const infoDiv = document.createElement('div');
    infoDiv.classList.add(
      'flex',
      'items-center',
      'flex-col',
      'bg-c2',
      'rounded-lg', 
      'text-white',
      'text-center',
      'p-4',
      'mx-3'
    );

    const infoText = document.createElement('p');
    infoText.innerHTML = `
      <h2 class="text-lg font-semibold">Ihre Einkaufsliste ist derzeit leer.</h2>
      <p>Wenn Sie eine neue Einkaufsliste generieren möchten, werden alle Einträge in den Menulisten gelöscht</p>
    `;

    const generiereEinkaufslisteBtn = document.createElement('button');
    generiereEinkaufslisteBtn.classList.add(
      'generiere-einkaufsliste-btn',
      'bg-green-400',
      'text-black',
      'py-2',
      'px-4',
      'rounded',
      'hover:bg-green-600',
      'cursor-pointer',
      'mt-4',
      'font-semibold'
    );
    generiereEinkaufslisteBtn.innerText = 'Neue Einkaufsliste generieren';
    

    container.appendChild(infoDiv);
    infoDiv.appendChild(infoText);
    infoDiv.appendChild(generiereEinkaufslisteBtn);
  }


  renderProdukt(produkt, container) {
    const produktContainer = document.createElement('div');
    container.appendChild(produktContainer)
    produktContainer.classList.add(
      `produkt-container-${produkt.id}`,
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

    const produktNameDiv = document.createElement('div');
    produktNameDiv.textContent = produkt.produktName;
    produktContainer.appendChild(produktNameDiv)
    produktNameDiv.classList.add(
      'produkt-name',
      'basis-1/4',
    );

    const mengeDiv = document.createElement('div');
    mengeDiv.textContent = produkt.einkaufsMenge;
    produktContainer.appendChild(mengeDiv);
    mengeDiv.classList.add(
      'produkt-menge',
      'basis-1/4'
    );

    const scanningBtnContanier = document.createElement('div');
    produktContainer.appendChild(scanningBtnContanier)
    scanningBtnContanier.classList.add(
      'flex',
      'items-center',
      'justify-center'
    )
    const scanningBtn = document.createElement('button');
    scanningBtn.dataset.id = produkt.id;
    scanningBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M40-120v-200h80v120h120v80H40Zm680 0v-80h120v-120h80v200H720ZM160-240v-480h80v480h-80Zm120 0v-480h40v480h-40Zm120 0v-480h80v480h-80Zm120 0v-480h120v480H520Zm160 0v-480h40v480h-40Zm80 0v-480h40v480h-40ZM40-640v-200h200v80H120v120H40Zm800 0v-120H720v-80h200v200h-80Z"/></svg>`
    scanningBtnContanier.appendChild(scanningBtn)

    
    scanningBtn.classList.add(
      'scan-btn',
      'rounded',
      'bg-green-400',
      'p-2',
      'hover:bg-green-600'
    )
  }



  async handleScanClick(event) {
    if (this.einkaufsliste.length === 1) {
      localStorage.removeItem('morgenessenMenüs');
      localStorage.removeItem('mittagessenMenüs');
      localStorage.removeItem('abendessenMenüs');
      localStorage.removeItem('provEinkaufsliste')
      //localStorage.removeItem('.einkaufsliste');
    }

    let node = event.target; 
    while (node.nodeName.toLowerCase() !== 'button') {
      node = node.parentElement;
    }

    const id = node.dataset.id.toString();
    const einkaufsProdukt = this.einkaufsliste.find(p => p.id === id);
    const produktContainer = document.querySelector(`.produkt-conatiner-${id}`)

    let result = await this.scannProdukt();
    console.log(result)
    let istGültig = await this.checkeGültigkeit(einkaufsProdukt, result);

    if (istGültig) {
      await this.produktMengeCheck(true, einkaufsProdukt, result);
    } else {
      this.überschreibeProdukt(einkaufsProdukt, result);
    }
  }


  addEventListeners() {
  
    // Event-Listener für den Scan-Button hinzufügen (alle Buttons mit einer bestimmten Klasse oder ID)
    const scanButtons = document.querySelectorAll('.scan-btn');
    scanButtons.forEach((scanningBtn) => {
      scanningBtn.addEventListener('click', async (event) => {  
        //wenn das letzte produkt eingescannt wird sollte die einkaufsliste nicht mehr erstellt werden, somit wird dann das infodiv angezeigt
        this.handleScanClick(event);
      })
    });

    const generiereEinkaufslisteBtn = document.querySelector('.generiere-einkaufsliste-btn');
    generiereEinkaufslisteBtn.addEventListener('click', () => {
      localStorage.removeItem('einkaufsliste');
      localStorage.removeItem('provEinkaufsliste');
      window.open('Prov-Einkaufsliste.html');
    });
  }
}


const einkaufsliste = new Einkaufsliste();

export { Einkaufsliste }
