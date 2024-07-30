import { fetchSynonyms } from './databaseConnection4.js';
import { fetchTranslation, detectLanguage } from './databaseConnection3.js';
import { getVerbrauchFromLocalStorage, getBestandFromLocalStorage, saveBestandToLocalStorage ,erstelleAktualisiertenBestand, bereinigeProvEinkaufsliste} from './einkaufsliste-provisorisch.js';

document.querySelector('.prov-einkaufsliste-container').innerHTML = ''

/*
const scanner = new Html5QrcodeScanner('reader',{
  qrbox: {
      width: 250,
      height: 250,
  },
  fps: 20,
});

scanner.render(success,error);

function success(result){
  document.getElementById('result').innerHTML = `
  <h2>Erfolgreich gescannt</h2>
  <p><a href="${result}">${result}</a></p>
  <br><br>
  <a href="index.html">nochmal scannen</a>
      `;
  scanner.clear();
  document.getElementById('reader').remove();

}

function error(err){
  //console.error(err);
}
*/
console.log('test')


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

/*

 Swal.fire({
            title: "Achtung!",
            html: `<p class="text-lg font-semibold">Es ist nur noch ein Produkt in der Einkaufsliste</p><br>
            Da Ihr Einkauf nach dem einscannen dieses letzte Produktes zu Ende ist, werden Ihre Menupläne und der Verbrauch zurückgesetzt`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Einverstanden",
            cancelButtonText: "Nein, noch nicht zurücksetzen"
*/

const abgeglicheneProdukte = {
  gefundeneProdukte: [
    {
      barcode: "002",
      description: "apfel",
      id: "1720542805369",
      menge: 1,
      menuMenge: "1",
      menuZutatName: "apfel",
      zutatStatus: "gleich"
    },
    {
      barcode: "003",
      description: "birne",
      id: "1720542807593",
      menge: -1,
      menuMenge: "1",
      menuZutatName: "birne",
      zutatStatus: "gleich"
    },
    {
      barcode: "003",
      description: "birne",
      id: "1720542809690",
      menge: -1,
      menuMenge: "1",
      menuZutatName: "poire",
      zutatStatus: "gleich"
    },
    {
      barcode: "002",
      description: "apfel",
      id: "1720542811910",
      menge: 1,
      menuMenge: "1",
      menuZutatName: "apfelfrucht",
      zutatStatus: "ähnlich"
    },
    {
      barcode: "002",
      description: "apfel",
      id: "1720542814204",
      menge: 1,
      menuMenge: "1",
      menuZutatName: "Liebesapfel",
      zutatStatus: "ähnlich"
    },
    {
      barcode: "001",
      description: "tomate",
      id: "1720542818677",
      menge: 2,
      menuMenge: "1",
      menuZutatName: "Cherrytomate",
      zutatStatus: "ähnlich"
    }
  ],
  nichtGefundeneProdukte: [
    {
      id: "1720542816441",
      menuMenge: "1",
      menuZutatName: "Brot",
      synonyme: [
        "strafbare handlung",
        "krimineller akt",
        "illegale handlung",
        "unrechtstat",
        "verbrechen",
        "straftat",
        "tat",
        "untat",
        "brotlaib",
        "wecken "
      ],
      übersetzung: "delikt"
    },
    {
      id: "1720542820919",
      menuMenge: "1",
      menuZutatName: "ground beef",
      synonyme: [
        "haschee",
        "gewiegtes",
        "faschiertes",
        "gehacktes",
        "hack"
      ],
      übersetzung: "hackfleisch"
    }
  ]
};


//bereinigteProvEk wird durchgegegangen und die menuMengeTot wird der bestands.menge abgezogen um die einkaufsmenge zu erstellen
function erstelleEinkaufsliste() {
  let bereinigteProvEinkaufsliste = bereinigeProvEinkaufsliste();
  let aktualisierterBestand = erstelleAktualisiertenBestand(getBestandFromLocalStorage(), getVerbrauchFromLocalStorage());
  let einkaufsliste = [] //getEinkaufslisteFromLocalStorage();
  let gleichesBestandsProdukt;

  bereinigteProvEinkaufsliste.forEach((p) => {
    gleichesBestandsProdukt = aktualisierterBestand.find((akbProdukt) => {
      return akbProdukt.description ===  Object.keys(p)[0];
    })

    if (gleichesBestandsProdukt) {
      let neueMenge = gleichesBestandsProdukt.menge - p.menuMengeTot;
      if (neueMenge >= 0) {
        einkaufsliste.push({'id': Object.values(p)[0][0].id , 'produktName': Object.keys(p)[0], 'neueMenge': neueMenge, 'einkaufsMenge': 0})
      } else {
        let einkaufsMenge = neueMenge * -1;
        einkaufsliste.push({'id': Object.values(p)[0][0].id , 'produktName': Object.keys(p)[0], 'neueMenge': neueMenge, 'einkaufsMenge': einkaufsMenge})
      }
    } else {
      einkaufsliste.push({'id': Object.values(p)[0][0].id ,'produktName': Object.keys(p)[0], 'einkaufsMenge': p.menuMengeTot})
    }
  })
  console.log(einkaufsliste)
  return einkaufsliste;
}

function getEinkaufslisteFromLocalStorage() {
  let einkaufsliste = [];
  const data = localStorage.getItem('einkaufsliste');
  console.log(data)
  if (data !== undefined && data !== null && data !== '[]') {
    einkaufsliste = JSON.parse(data);
  } else {
    einkaufsliste = erstelleEinkaufsliste();
  }
  return einkaufsliste;
}

function saveEinkaufslisteToLocalStorage(einkaufsliste) {
  localStorage.setItem('einkaufsliste', JSON.stringify(einkaufsliste))
}




function renderEinkaufslisteHTML() {
  let einkaufsliste = getEinkaufslisteFromLocalStorage()
  const einkaufslisteContainer = document.querySelector('.einkaufsliste-container');
  einkaufslisteContainer.innerHTML = '';


  const testBtn = document.createElement('button');
  einkaufslisteContainer.appendChild(testBtn);
  testBtn.classList.add('bg-white', 'h-6', 'w-6');
  testBtn.addEventListener('click', () => {
    console.log(einkaufsliste)
  })

  if (!einkaufsliste.some(p => p.einkaufsMenge !== 0)) {
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

    const generationsBtn = document.createElement('a');
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
    generationsBtn.href = 'Provisorische-einkaufsliste.html';

    einkaufslisteContainer.appendChild(infoDiv);
    infoDiv.appendChild(infoText);
    infoDiv.appendChild(generationsBtn);

    generationsBtn.addEventListener('click', () => {
      console.log(localStorage.getItem('morgenessenMenus'))
    });
  } else {
    console.log('test')
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

        scanningBtn.addEventListener('click', (event) => {  
          let node = event.target; 
          while (node.nodeName.toLowerCase() !== 'button') {
            node = node.parentElement;
          }
        
          const id = node.dataset.id.toString();
          const einkaufsProdukt = einkaufsliste.find(p => p.id === id);
          const produktContainer = document.querySelector(`.produkt-conatiner-${id}`)

          let result = scanneEinkaufsProdukt(event);
          let istGültig = checkeGültigkeit(einkaufsProdukt, result);
          let istÜberschrieben;

          console.log(istGültig)
          if (istGültig) {
            produktMengeCheck(true, einkaufsProdukt, result);
          } else {
            überschreibeProdukt(einkaufsProdukt, result);
          }

          console.log('test1')
          einkaufsliste.splice(einkaufsliste.indexOf(produkt), 1);
          saveEinkaufslisteToLocalStorage(einkaufsliste);
          console.log(einkaufsliste)

          localStorage.removeItem('provEinkaufsliste');
          localStorage.removeItem('einkaufsliste');
          localStorage.removeItem('morgenessenMenus');
          localStorage.removeItem('mittagessenMenus');
          localStorage.removeItem('abendessenMenus');
      
          /*
          produktContainer.classList.add('.hidden-container');
          produktContainer.addEventListener('transitionend', () => {
            produktContainer.remove();
          });
          */
          /*
          produktContainer.style.animationPlayState = 'running';
          produktContainer.addEventListener('animationend', () => {
          produktContainer.remove();
          })*/



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
renderEinkaufslisteHTML();


function scanneEinkaufsProdukt(event) {
/*
  if(!scanner) {
    initializeScanner();
    scanner = true;
  }
  */
  let result = {
    description: 'apfel',
    barcode: '002'
  }
  return result; 
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
function checkeGültigkeit(einkaufsProdukt, result) {
  //let ähnlicheProdukte = erstelleÄhnlicheProdukte(result.description);
  let ähnlicheProdukte = {
    produktName: 'apfel',
    übersetzung: 'apfel',
    alleSynonyme: ['apfelfrucht', 'liebesapfel']
  };
  let ähnlichesProdukt;
  console.log(einkaufsProdukt)
  let gleichesProdukt = (Object.values(ähnlicheProdukte)[0].toLocaleLowerCase() === einkaufsProdukt.produktName) ? true : false;
  let gleichesÜbersetzungsProdukt = (Object.values(ähnlicheProdukte)[1].toLocaleLowerCase() === einkaufsProdukt.produktName) ? true : false;

  Object.values(ähnlicheProdukte)[2].forEach((synonym) => {
    ähnlichesProdukt = (synonym.toLocaleLowerCase() === einkaufsProdukt.produktName) ? true : false;
  })
  
  console.log(gleichesProdukt)
/*
  Object.keys(ähnlicheProdukte).forEach((key) => {
    if (key === 'produktName') {
      gleichesProdukt = (ähnlicheProdukte[key].toLowerCase() === einkaufsProdukt.produktName) ? true : false;
    } 
    if (key === 'übersetzung') {
      gleicheÜbersetzung = (ähnlicheProdukte[key].toLowerCase() === einkaufsProdukt.produktName) ? true : false;
    } 
    if (key === 'alleSynonyme') {
      ähnlicheProdukte[key].forEach((synonym) => {
        ähnlichesProdukt = (einkaufsProdukt.produktMenge === synonym) ? true : false;
      })  
    }
  })
*/

  let istGültig = (ähnlichesProdukt || gleichesProdukt || gleichesÜbersetzungsProdukt) ? true : false;
  return istGültig;
}


//check ob die Menge die eingegeben wurde mit der menge übereinstimmt die in der einkaufsliste angegeben ist. 
//auch möglich die Menge zu überschreiben.
async function produktMengeCheck(istÜberschrieben, einkaufsProdukt, result) {
  console.log(istÜberschrieben)
  const inputValue = '';
  const { value: menge } = await Swal.fire({
    title: "Prüfung der Stückanzahl",
    input: "text",
    html: `Wie viele Stück von <b>${istÜberschrieben ? result.description : einkaufsProdukt.produktName}</b> haben Sie im Einkaufskorb`,
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
          
        }).then((r) => {
          if (r.isConfirmed) {
            updateBestand(istÜberschrieben, einkaufsProdukt, Number(menge))
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Tiptop, Ihr Vorrat wurde erfolgreich aktualisiert",
              showConfirmButton: false,
              timer: 1500
            });
          } else {
            produktMengeCheck(istÜberschrieben, einkaufsProdukt, result)
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
  Swal.fire({
    title: `Fehler beim einscannen des Produktes`,
    html: `<p style="font-size: 16px;">Das eingescannte Produkt stimmt nicht mit dem Produkt in der Einkaufsliste überein</p><br>Eingescanntes Produkt: <b>${result.description}</b><br>Einkaufslistenprodukt: <b>${einkaufsProdukt.produktName}</b>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    cancelButtonText: "Nein, nochmals scannen",
    confirmButtonText: "Ja, Einkaufslistenprodukt überschreiben"
    /*
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleted!",
        text: "Your file has been deleted.",
        icon: "success"
      });
    }
    */
  }).then((r) => {
    if (r.isConfirmed) {
      produktMengeCheck(true, {...einkaufsProdukt, description: result.description}, result)
    }
  });
}

//bestand die bestnadsMenge des bestehenden Proudktes wird geupdatet oder wenn noch nicht vorhanden wird das einkaufsProdukt dem Bestand neu zugefügt
function updateBestand(istÜberschrieben, produkt, neueMenge) {
  let bestand = getBestandFromLocalStorage()
  let bestandsProdukt;
  if (istÜberschrieben) {
    bestandsProdukt = bestand.find(p => p.description === produkt.description) 
  } else {
    bestand.find(p => p.description === produkt.produktName)
  }

  console.log(bestandsProdukt)
  console.log(istÜberschrieben)
  console.log(produkt)
  console.log(neueMenge)

  if(bestandsProdukt) { 
    console.log(bestandsProdukt.menge)    
    bestandsProdukt.menge += neueMenge;
    console.log(bestandsProdukt.menge)
    saveBestandToLocalStorage(bestand);
    console.log(bestandsProdukt.menge)

  } else {
    bestand.push({...produkt, description: produkt.produktName, menge: neueMenge});
    saveBestandToLocalStorage(bestand);
  }
  console.log(bestand)
  renderEinkaufslisteHTML()
}