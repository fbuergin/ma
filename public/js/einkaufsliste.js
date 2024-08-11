import { fetchSynonyms } from './databaseConnection4.js';
import { fetchTranslation, detectLanguage } from './databaseConnection3.js';
import { getVerbrauchFromLocalStorage, getBestandFromLocalStorage, saveBestandToLocalStorage ,erstelleAktualisiertenBestand, getProvEinkaufslisteFromLocalStorage, generiereId} from './einkaufsliste-provisorisch.js';
import { fetchProductData, error } from './databaseConnection.js';


window.onload = function() {
  console.log(getEinkaufslisteFromLocalStorage())
  saveEinkaufslisteToLocalStorage(erstelleEinkaufsliste());
  renderEinkaufslisteHTML();
}



//scanner
let scanner = false;

function scanProdukt() {
  if (!scanner) {
    initializeScanner();
    scanner = true; 
    //document.querySelector('.scanning-btn').remove();
    console.log('Scanner gestartet');
    //document.querySelector('.scanning-btn-container').classList.remove('flex')
    document.querySelector('.einkaufsliste-container').classList.remove('flex')
    //document.querySelector('.scanning-btn-container').classList.add('hidden')
    document.querySelector('.einkaufsliste-container').classList.add('hidden')
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
}
/*
function scanProduktnochmals() {
  if (!scanner) {
    scanner = true; 
    initializeScanner();
    document.querySelector('.nochmals-scannen-btn').remove();
    console.log('Scanner gestartet');
  }
}
*/

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
    //document.querySelector('.nochmals-scannen-btn').style.display = "block"; 
    scanner.clear();
    document.getElementById('reader').remove();
    let neuesProdukt = await fetchProductData(result);
}
//maybe probleme mit error function also in verbrauch.js angegeben das es das braucht



/*
async function produkteUndZutatenAbgleichen(menuPläne, aktualisierterBestand) {
  const abgeglicheneProdukte =  {
    gefundeneProdukte: [],
    nichtvorhandeneProdukte: []
  };
  console.time('abgeglicheneProdukte wird erstellt')


  for (const menuPlan of menuPläne) {
    for (const menu of menuPlan) {
      for (const menuZutat of menu.zutaten) {
        try {
          const produktName = menuZutat.produktName.toLowerCase();
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

          let ProduktEnthaltenImBestand = aktualisierterBestand.find(aktualisierterBestandProdukt => aktualisierterBestandProdukt.description === übersetzung);
          let synonymEnthaltenImBestand;
          let menuZutatEnthaltenImAkprodukt;
          let akproduktEnthaltenInMenuZutat;

          for (const synonym of alleSynonyme) {
            synonymEnthaltenImBestand = aktualisierterBestand.find(aktualisierterBestandProdukt => aktualisierterBestandProdukt.description === synonym);

          }

          for (const produkt of aktualisierterBestand) {
            if (produkt.description.toLowerCase().includes(produktName)) {
              menuZutatEnthaltenImAkprodukt = produkt;
            } else if (produktName.includes(produkt.description.toLowerCase())) {
              akproduktEnthaltenInMenuZutat = produkt;
            }
          }
          

          if (ProduktEnthaltenImBestand) {
            abgeglicheneProdukte.gefundeneProdukte.push({ ...ProduktEnthaltenImBestand, herkunft: menuZutat, menuMenge: menuZutat.menge });

          } else if (synonymEnthaltenImBestand) {
            abgeglicheneProdukte.gefundeneProdukte.push({ ...synonymEnthaltenImBestand, herkunft: menuZutat, menuMenge: menuZutat.menge });

          } else if (menuZutatEnthaltenImAkprodukt){
            abgeglicheneProdukte.gefundeneProdukte.push({ ...menuZutatEnthaltenImAkprodukt, herkunft: menuZutat, menuMenge: menuZutat.menge });

          } else if (akproduktEnthaltenInMenuZutat) {
            abgeglicheneProdukte.gefundeneProdukte.push({ ...akproduktEnthaltenInMenuZutat, herkunft: menuZutat, menuMenge: menuZutat.menge });

          } else { 
            abgeglicheneProdukte.nichtvorhandeneProdukte.push({...menuZutat, übersetzung: übersetzung, synonyme: alleSynonyme} )
          } 
          
          
            
          

        } catch (error) {
          console.error('Fehler beim Abrufen von Synonymen:', error);
        }
      }
    }
  }  
  console.timeEnd("abgeglicheneProdukte wird erstellt")
  console.log(abgeglicheneProdukte)
  return abgeglicheneProdukte;  
}

produkteUndZutatenAbgleichen(menuPläne, kreiereAktualisierterBestand(bestand, verbrauch))
*/
function formatiereErstesWort(string) {
  let worte = string.toLocaleLowerCase().split(' ');
  let erstesWort = worte[0].charAt(0).toUpperCase() + worte[0].slice(1);
  worte[0] = erstesWort; 
  return worte.join(' ')
}



export function formatiereString(string) {
  const ausnahmen = [
    'der', 'die', 'das', 'ein', 'eine', 'einer', 'eines', 'einem', 'einen', 'dessen', 'deren', 'dem',
    'den', 'auf', 'ab', 'mit', 'in', 'an', 'bei', 'nach', 'von', 'zu', 'über', 'unter', 'vor', 'hinter', 
    'neben', 'zwischen', 'durch', 'gegen', 'ohne', 'um', 'bis', 'entlang', 'und', 'oder', 'aber', 'denn', 
    'sondern', 'doch', 'sowie', 'sowohl', 'als', 'wie', 'entweder', 'noch', 'weder', 'ob', 'weil', 'dass', 
    'wenn', 'falls', 'obwohl', 'während', 'sobald', 'bevor', 'nachdem', 'lecker', 'frisch', 'süss', 'sauer', 
    'salzig', 'bitter', 'würzig', 'pikant', 'knusprig', 'zart', 'rot', 'orange', 'gelb', 'grün', 'blau', 'lila', 
    'rosa', 'braun', 'schwarz', 'weiss', 'saftig', 'trocken', 'reif', 'unreif', 'fettig', 'mager', 'cremig', 
    'hart', 'weich', 'geschmackvoll', 'fade', 'aromatisch', 'schmackhaft', 'mild', 'heiss', 'kalt', 'warm', 
    'gebraten', 'gekocht', 'gegrillt', 'gross', 'klein'
  ];
  
  
  let worte = formatiereErstesWort(string).split(' ')
  
   
  return worte.map(wort => {
      if (ausnahmen.includes(wort)) {
        return wort;
      }
      return wort.charAt(0).toUpperCase() + wort.slice(1);
  }).join(' ');
}


//Zwischen array ungeordneteProvEinkaufsliste wird erstellt, damit dann die produkte besser abgefragt werden können.
//von ungeordneteProvEinkaufsliste wird dann bereinigteProvEinkaufliste erstellt.
//gecheckt ob es mehrere gleiche produkte in der einkufsliste hat, damit von diesen dann die menuMenge zusammengezählt werden können. 
function bereinigeProvEinkaufsliste() {
  let provEinkaufsliste = getProvEinkaufslisteFromLocalStorage();
  let ungeordneteProvEinkaufsliste = [];
  let bereinigteProvEinkaufsliste = [];
  
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
  console.log(ungeordneteProvEinkaufsliste)

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
  console.log(provEinkaufsliste)
  return bereinigteProvEinkaufsliste;
}
    

//bereinigteProvEk wird durchgegegangen und die menuMengeTot wird der bestands.menge abgezogen um die einkaufsmenge zu erstellen
function erstelleEinkaufsliste() {
  let bereinigteProvEinkaufsliste = bereinigeProvEinkaufsliste();
  let aktualisierterBestand = erstelleAktualisiertenBestand();
  let einkaufsliste = [] //getEinkaufslisteFromLocalStorage();
  let gleichesBestandsProdukt;

  bereinigteProvEinkaufsliste.forEach((p) => {
    gleichesBestandsProdukt = aktualisierterBestand.find((akbProdukt) => {
      return akbProdukt.description ===  Object.keys(p)[0];
    })

    if (gleichesBestandsProdukt) {
      let neueMenge = gleichesBestandsProdukt.menge - p.menuMengeTot;
      //wenn die menge grösser oder 0 ist wird es nicht zu einkaufsliste zugefügt
      if (!neueMenge >= 0) {
        let einkaufsMenge = neueMenge * -1;
        einkaufsliste.push({'id': Object.values(p)[0][0].id , 'produktName': formatiereString(Object.keys(p)[0]), 'neueMenge': neueMenge, 'einkaufsMenge': einkaufsMenge})
      }
    } else {
      einkaufsliste.push({'id': Object.values(p)[0][0].id ,'produktName': formatiereString(Object.keys(p)[0]), 'einkaufsMenge': p.menuMengeTot})
    }
  })
  console.log(bereinigteProvEinkaufsliste)
  return einkaufsliste;
}

function getEinkaufslisteFromLocalStorage() {
  let einkaufsliste = [];
  const data = localStorage.getItem('einkaufsliste');
  console.log(data)
  if (data !== undefined && data !== null) {
    einkaufsliste = JSON.parse(data);
  } else {
    //einkaufsliste = erstelleEinkaufsliste();
    einkaufsliste = []
  }
  return einkaufsliste;
}

function saveEinkaufslisteToLocalStorage(einkaufsliste) {
  localStorage.setItem('einkaufsliste', JSON.stringify(einkaufsliste))
}




function renderEinkaufslisteHTML() {
  let einkaufsliste = getEinkaufslisteFromLocalStorage();
  const einkaufslisteContainer = document.querySelector('.einkaufsliste-container');
  einkaufslisteContainer.innerHTML = '';


  const testBtn = document.createElement('button');
  einkaufslisteContainer.appendChild(testBtn);
  testBtn.classList.add('bg-white', 'h-6', 'w-6');
  testBtn.addEventListener('click', () => {
    console.log(einkaufsliste)
    console.log(getProvEinkaufslisteFromLocalStorage())
  })
  
  if (einkaufsliste.length === 0) {
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
    infoText.classList.add(
    );
    infoText.innerHTML = `
    <h2 class="text-lg font-semibold">Deine Einkaufsliste ist derzeit leer.</h2>
    <p>Wenn du eine neue Einkaufsliste generieren möchtest, werden alle Einträge in deinen Menulisten gelöscht</p>
    `;

    const generationsBtn = document.createElement('button');
    generationsBtn.classList.add(
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
    generationsBtn.innerText = 'Neue Einkaufsliste generieren';
    generationsBtn.addEventListener('click', () => {
      localStorage.removeItem('einkaufsliste');
      localStorage.removeItem('provEinkaufsliste');
      window.open('Prov-Einkaufsliste.html');
    });

    einkaufslisteContainer.appendChild(infoDiv);
    infoDiv.appendChild(infoText);
    infoDiv.appendChild(generationsBtn);

  } else {
    einkaufsliste.forEach(produkt => {
      if (produkt.produktName && produkt.einkaufsMenge !== 0) {
        const produktContainer = document.createElement('div');
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
        produktNameDiv.classList.add(
          'produkt-name',
          'basis-1/4',
        );
        produktNameDiv.textContent = produkt.produktName;
        produktContainer.appendChild(produktNameDiv);
    
        const mengeDiv = document.createElement('div');
        mengeDiv.classList.add(
          'produkt-menge',
          'basis-1/4'
        );
        mengeDiv.textContent = produkt.einkaufsMenge;
        produktContainer.appendChild(mengeDiv);
    
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
        console.log('test3')

        scanningBtn.addEventListener('click', async (event) => {  
          //wenn das letzte produkt eingescannt wird sollte die einkaufsliste nicht mehr erstellt werden, somit wird dann das infodiv angezeigt
          if (einkaufsliste.length === 1) {
            localStorage.removeItem('morgenessenMenus');
            localStorage.removeItem('mittagessenMenus');
            localStorage.removeItem('abendessenMenus');
            localStorage.removeItem('provEinkaufsliste')
            //localStorage.removeItem('einkaufsliste');
          }

          let node = event.target; 
          while (node.nodeName.toLowerCase() !== 'button') {
            node = node.parentElement;
          }
        
          const id = node.dataset.id.toString();
          const einkaufsProdukt = einkaufsliste.find(p => p.id === id);
          const produktContainer = document.querySelector(`.produkt-conatiner-${id}`)

          let result = await scanneEinkaufsProdukt();
          let istGültig = await checkeGültigkeit(einkaufsProdukt, result);

          console.log(einkaufsliste)
          console.log(istGültig)
          console.log(einkaufsProdukt)
          if (istGültig) {
            await produktMengeCheck(true, einkaufsProdukt, result);
          } else {
            überschreibeProdukt(einkaufsProdukt, result);
          }
        })
        scanningBtn.classList.add(
          'rounded',
          'bg-green-400',
          'p-2',
          'hover:bg-green-600'
        )
        einkaufslisteContainer.appendChild(produktContainer)
      }
    })
  }
}





async function scanneEinkaufsProdukt() {
  /*
  let result =  await fetchProductData('16118652')
  return result; 
  */
 scanProdukt();
}



async function erstelleÄhnlicheProdukte(produktName) {
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
async function checkeGültigkeit(einkaufsProdukt, result) {
  let ähnlicheProdukte = await erstelleÄhnlicheProdukte(result.description ||  result.title);
  let einkaufsProduktName = einkaufsProdukt.produktname.toLocaleLowerCase();
  let ähnlichesProdukt;

  let gleichesProdukt = (Object.values(ähnlicheProdukte)[0].toLocaleLowerCase() === einkaufsProduktName) ? true : false;
  let gleichesÜbersetzungsProdukt = (Object.values(ähnlicheProdukte)[1].toLocaleLowerCase() === einkaufsProduktName) ? true : false;

  Object.values(ähnlicheProdukte)[2].forEach((synonym) => {
    ähnlichesProdukt = (synonym.toLocaleLowerCase() === einkaufsProduktName) ? true : false;
  })
  
  let istGültig = (ähnlichesProdukt || gleichesProdukt || gleichesÜbersetzungsProdukt) ? true : false;
  return istGültig;
}


//check ob die Menge die eingegeben wurde mit der menge übereinstimmt die in der einkaufsliste angegeben ist. 
//auch möglich die Menge zu überschreiben.
async function produktMengeCheck(istÜberschrieben, einkaufsProdukt, result) {
  istÜberschrieben = false;
  console.log(istÜberschrieben)
  const inputValue = '';
  const { value: menge } = await Swal.fire({
    title: "Prüfung der Stückanzahl",
    input: "text",
    html: `Wie viele Stück von <b>${istÜberschrieben ? result.description || result.title : einkaufsProdukt.produktName}</b> haben Sie im Einkaufskorb`,
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
  }).then((r) => {
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
            if (istÜberschrieben) {
              updateBestand(istÜberschrieben, result, Number(menge));
            } else {
              updateBestand(istÜberschrieben, {...einkaufsProdukt, 'barcode' : result.barcode}, Number(menge));
              console.log('test in produktMengeCheck')
            }
            //updateBestand(istÜberschrieben, einkaufsProdukt, Number(menge))
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Tiptop, Ihr Vorrat wurde erfolgreich aktualisiert",
              showConfirmButton: false,
              timer: 1500
            });
          } else {
            await produktMengeCheck(istÜberschrieben, einkaufsProdukt, result)
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
        if (istÜberschrieben) {
          updateBestand(istÜberschrieben, result, Number(menge));
        } else {
          updateBestand(istÜberschrieben, {...einkaufsProdukt, 'barcode' : result.barcode}, Number(menge));
        }
      }
    }
  })
}


//falls das result nicht mit dem einkaufsprodukt übereinstimmt kann das einkaufsprodukt überschrieben werden.
function überschreibeProdukt(einkaufsProdukt, result) {
  let istÜberschrieben = false;
  let einkaufsliste = getEinkaufslisteFromLocalStorage();
  Swal.fire({
    title: `Fehler beim einscannen des Produktes`,
    html: `<p style="font-size: 16px;">Das eingescannte Produkt stimmt nicht mit dem Produkt in der Einkaufsliste überein</p><br>Eingescanntes Produkt: <b>${result.description}</b><br>Einkaufslistenprodukt: <b>${einkaufsProdukt.produktName}</b>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    cancelButtonText: "Nein, nochmals scannen",
    confirmButtonText: "Ja, Einkaufslistenprodukt überschreiben"

  }).then(async (r) => {
    if (r.isConfirmed) {
      let vorhandenesEinkaufslisteProdukt = einkaufsliste.find(p => p.produktName === result.description) || einkaufsliste.find(p => p.produktName === result.title);
      let index = einkaufsliste.findIndex(p => p.produktName === einkaufsProdukt.produktName);

      console.log(vorhandenesEinkaufslisteProdukt)
      if (vorhandenesEinkaufslisteProdukt) {
        vorhandenesEinkaufslisteProdukt.einkaufsMenge += einkaufsProdukt.einkaufsMenge;
        einkaufsliste.splice(index, 1);
      } else {
        einkaufsliste[index] = {id: generiereId(), produktName: result.description || result.title, einkaufsMenge: einkaufsProdukt.einkaufsMenge};
      }

      saveEinkaufslisteToLocalStorage(einkaufsliste);
      renderEinkaufslisteHTML();
    }
  });
}

//updateBestand fügt immer das einkaufsProdukt (produkt) dem Bestand zu.
function updateBestand(istÜberschrieben, produkt, neueMenge) {
  istÜberschrieben = false;

  let bestand = getBestandFromLocalStorage()
  let einkaufsliste = getEinkaufslisteFromLocalStorage();
  let bestandsProdukt;
  if (istÜberschrieben) {
    bestandsProdukt = bestand.find(p => p.description === produkt.description) || bestand.find(p => p.title === produkt.title) || bestand.find(p => p.description === produkt.title)
  } else {
    bestandsProdukt = bestand.find(p => p.description === produkt.produktName) || bestand.find(p => p.title === produkt.produktName) 
  }

  console.log(bestandsProdukt)
  console.log(istÜberschrieben)
  console.log(produkt)

  if(bestandsProdukt) { 
    bestandsProdukt.menge += neueMenge;
    saveBestandToLocalStorage(bestand);

  } else {
    //bestand.push({...produkt, description: produkt.produktName, menge: neueMenge});
    bestand.push({...produkt, menge: neueMenge, description: produkt.produktName});
    saveBestandToLocalStorage(bestand);
  }
  console.log(bestand)
  console.log(einkaufsliste)

  let index = einkaufsliste.findIndex(p => p.produktName === produkt.produktName);
  einkaufsliste.splice(index, 1);
  saveEinkaufslisteToLocalStorage(einkaufsliste);
  console.log(einkaufsliste)
  renderEinkaufslisteHTML()
}