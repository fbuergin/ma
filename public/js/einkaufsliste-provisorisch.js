import { fetchSynonyms } from './databaseConnection4.js';
import { fetchTranslation, detectLanguage } from './databaseConnection3.js';

window.onload = async function() {
  //localStorage.removeItem('provEinkaufsliste');
  //localStorage.removeItem('einkaufsliste');
  renderProvEinkaufsliste(await produkteUndZutatenAbgleichen(getMenuPläneFromLocalStorage(), erstelleAktualisiertenBestand()));
  console.log(istProvEinkaufslisteVoll(getProvEinkaufslisteFromLocalStorage()))
  console.log(getProvEinkaufslisteFromLocalStorage())
}

//blocked dass man auf andere Seiten kommen kann. Sonst ist es möglich die Prov-einkaufsliste zu übersprinen. Dies ist möglich wenn zuerst auf Prov-einkaufsliste -> dann auf anderer seite (z.b Bestand) und dann klickt man direkt auf Einkaufsliste was dazu führt das diese geöfnet wird und Einkaufsliste anzeigt
function blockLinks() {
  const links = document.getElementsByTagName('a');
  //gibt HTML Collection zurück und kein Array, deshalb kein forEach möglich
  for (let i = 0; i < links.length; i++) {
    links[i].classList.add('pointer-events-none');
  }
}

function entblockLinks() {
  const links = document.getElementsByTagName('a');

  for (let i = 0; i < links.length; i++) {
    links[i].classList.add('pointer-events-auto');
  }
}

/*
const abgeglicheneProdukte = {
  gefundeneProdukte: [
    {
      barcode: "002",
      description: "apfel",
      id: "1720542805369",
      menge: 1,
      menuMenge: "12",
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
*/
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


export function generiereId() {
  const now = new Date();
  const timestamp = now.valueOf();
  return timestamp.toString();
}

export function getBestandFromLocalStorage() {
  let bestand = []
  const bestandData = localStorage.getItem('bestand');
  if (bestandData !== 'undefined' && bestandData) {
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
  }
  return bestand;
}
// Speichern des Bestands im Local Storage
export function saveBestandToLocalStorage(bestand) {
  localStorage.setItem('bestand', JSON.stringify(bestand));
}

export function getVerbrauchFromLocalStorage() {
  let verbrauch;
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
  }
  return verbrauch;
}

function getMenuPläneFromLocalStorage() {
  let menuPläne = [];

  const morgenessenMenuPlan = localStorage.getItem('morgenessenMenus');
  const mittagessenMenuPlan = localStorage.getItem('mittagessenMenus');
  const abendessenMenuPlan = localStorage.getItem('abendessenMenus');
  
  
  if (morgenessenMenuPlan) {
    menuPläne.push(JSON.parse(morgenessenMenuPlan));
  }
  if (mittagessenMenuPlan) {
    menuPläne.push(JSON.parse(mittagessenMenuPlan));
  }
  if (abendessenMenuPlan) {
    menuPläne.push(JSON.parse(abendessenMenuPlan));
  }
  return menuPläne;
}

export function getProvEinkaufslisteFromLocalStorage() {
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
    console.log(provEinkaufsliste)
  }
  return provEinkaufsliste;
}

export function saveProvEinkaufslisteToLocalStorage(provEinkaufsliste) {
  localStorage.setItem('provEinkaufsliste', JSON.stringify(provEinkaufsliste))
}


function istNichtUngültig(value1, value2) {
  let istNichtUndefined = value1 !== undefined && value2 !== undefined;
  let istNichtEmpty = value1 !== '' && value2 !== '';
  let istNichtNull = value1 !== null && value2 !== null;

  return istNichtUndefined && istNichtEmpty && istNichtNull ? true : false;
}


//Die Produkte des Verbrauchs werden dem Bestand abgezogen
export function erstelleAktualisiertenBestand() {
  let aktualisierterBestand = [];
  let bestand = getBestandFromLocalStorage();
  let verbrauch = getVerbrauchFromLocalStorage();
  
  bestand.forEach((bestandsItem) => {
    let gefundenInVerbrauch = verbrauch.find(verbrauchsItem => 
      verbrauchsItem.description === bestandsItem.description && istNichtUngültig(verbrauchsItem.description, bestandsItem.description) ||
      verbrauchsItem.title === bestandsItem.title && istNichtUngültig(verbrauchsItem.title, bestandsItem.title) ||
      verbrauchsItem.description === bestandsItem.title && istNichtUngültig(verbrauchsItem.description, bestandsItem.title) ||
      verbrauchsItem.title === bestandsItem.description && istNichtUngültig(verbrauchsItem.title, bestandsItem.description)
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
      bestandsItem.description === verbrauchsItem.description && istNichtUngültig(bestandsItem.description, verbrauchsItem.description) ||
      bestandsItem.title === verbrauchsItem.title && istNichtUngültig(bestandsItem.title, verbrauchsItem.title) ||
      bestandsItem.description === verbrauchsItem.title && istNichtUngültig(bestandsItem.description, verbrauchsItem.title) ||
      bestandsItem.title === verbrauchsItem.description && istNichtUngültig(bestandsItem.title, verbrauchsItem.description)
    );
    
    console.log('verbrauch: ' + verbrauchsItem.description)
    console.log('verbrauch: ' + verbrauchsItem.title)
    bestand.forEach((i) => {
      console.log('bestand: ' + i.description)
      console.log('bestand: ' + i.title)

    })
    

    if (!gefundenInBestand) {
      let neueMenge = verbrauchsItem.menge * -1;
      console.log('aeg')
      let newItem = { ...verbrauchsItem, menge: neueMenge };
      aktualisierterBestand.push(newItem);
    }
  });
  
  return aktualisierterBestand;
}
console.log('AkBestand:', erstelleAktualisiertenBestand(getBestandFromLocalStorage(), getVerbrauchFromLocalStorage()));
console.log('Menus:', getMenuPläneFromLocalStorage())



//Für jedes Produkt in den Menuplänen werden eine Übersetzung und diverse Synonyme erstellt.
//Diese werden dann mit dem BEstand abgeglichen um herauszufinden ob allenfalls schon gleiche Produkte im Bestand enthalten sind.
//Hauptsächlich eine vorsichtsmassnahme da es ja möglich ist dass ein produkt in einer anderen sprache schon vorhanden ist oder das
//jemand tomaten für ein salat braucht aber noch cherrytomaten hat und es dann unnötig wäre nochmals einzukaufen.
async function produkteUndZutatenAbgleichen(menuPläne, aktualisierterBestand) {
  const abgeglicheneProdukte =  {
    gefundeneProdukte: [],
    nichtGefundeneProdukte: []
  };

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
            abgeglicheneProdukte.gefundeneProdukte.push({ ...ProduktEnthaltenImBestand, id: generiereId(), menuZutatName: menuZutat.produktName, menuMenge: menuZutat.menge, zutatStatus: "gleich"});

          } else if (synonymEnthaltenImBestand) {
            abgeglicheneProdukte.gefundeneProdukte.push({ ...synonymEnthaltenImBestand, id: generiereId(), menuZutatName: menuZutat.produktName, menuMenge: menuZutat.menge, zutatStatus: "ähnlich"});

          } else if (menuZutatEnthaltenImAkprodukt){
            abgeglicheneProdukte.gefundeneProdukte.push({ ...menuZutatEnthaltenImAkprodukt, id: generiereId(), menuZutatName: menuZutat.produktName, menuMenge: menuZutat.menge, zutatStatus: "ähnlich"});

          } else if (akproduktEnthaltenInMenuZutat) {
            abgeglicheneProdukte.gefundeneProdukte.push({ ...akproduktEnthaltenInMenuZutat, id: generiereId(), menuZutatName: menuZutat.produktName, menuMenge: menuZutat.menge, zutatStatus: "ähnlich"});

          } else { 
            abgeglicheneProdukte.nichtGefundeneProdukte.push({...menuZutat, menuZutatName: menuZutat.produktName, menuMenge: menuZutat.menge, id: generiereId(), übersetzung: übersetzung, synonyme: alleSynonyme} )
          }  
        } catch (error) {
          console.error('Fehler beim Abrufen von Synonymen:', error);
        }
      }
    }
  }  
  console.log(abgeglicheneProdukte)
  return abgeglicheneProdukte;  
}

//await produkteUndZutatenAbgleichen(getMenuPläneFromLocalStorage(), erstelleAktualisiertenBestand())


function renderProvEinkaufsliste(abgeglicheneProdukte) {
  blockLinks();
  let provEinkaufsliste = getProvEinkaufslisteFromLocalStorage();
  const menuPläne = getMenuPläneFromLocalStorage();

  const provEinkaufslisteContainer = document.querySelector('.prov-einkaufsliste-container');
  provEinkaufslisteContainer.innerHTML = '';
  provEinkaufslisteContainer.classList.add(
    'px-4',
    'w-full',
  )

  const testBtn = document.createElement('button');
  provEinkaufslisteContainer.appendChild(testBtn);
  testBtn.classList.add('bg-white', 'h-6', 'w-6');
  testBtn.addEventListener('click', () => {
    /*let prov = getProvEinkaufslisteFromLocalStorage()
    prov = {
      gleicheProdukte: [],
      nichtGefundeneProdukte: [],
      ähnlicheProdukte: {
        original: [],
        umgewandelteProdukte: []
      }
    };
    saveProvEinkaufslisteToLocalStorage(prov)*/
    console.log(provEinkaufsliste)
  })

  //jedes Produkt der Menupläne wird abgebildet und dann markiert. Wenn es ein ähnlichesProdukt ist kann der Benutzer entscheiden ob es wirklich dieses Produkt nochmals einkaufen will, weil es ja schon ein ähnliches im Bestand hat.
  menuPläne.forEach((menuPlan, index) => {
    const menuPlanTitleContainer = document.createElement('div');
    const menuPlanTitle = document.createElement('h1');

    menuPlanTitleContainer.classList.add(
      'flex',
      'items-center',
      'justify-center',
      'text-white',
      'w-full',
      'mt-12',
      'mb-2'
    )
    menuPlanTitle.classList.add(
      'text-xl',
      'font-bold'
    )

    if(index === 0) {
      menuPlanTitle.innerText = 'Morgenessen Plan'
    } else if(index === 1) {
      menuPlanTitle.innerText = 'Mittagessen Plan'
    }else if(index === 2) {
      menuPlanTitle.innerText = 'Abendessen Plan'
    }
    menuPlanTitleContainer.appendChild(menuPlanTitle)
    provEinkaufslisteContainer.appendChild(menuPlanTitleContainer)
  
    const menusContainer = document.createElement('div');
    menusContainer.classList.add(
      'menus-container',
      'flex',
      'flex-col',
      'w-full',
      'gap-y-3',
      'text-white',
    )
    provEinkaufslisteContainer.appendChild(menusContainer);

    menuPlan.forEach(menu => {
      if (menu.zutaten.length > 0) {
        const menuEintragContainer = document.createElement('div');
        menusContainer.appendChild(menuEintragContainer);
        menuEintragContainer.classList.add(
          'flex',
          'bg-c2',
          'py-2',
          'rounded-lg',
        );
  
        const menuTagContainer = document.createElement('div');
        menuEintragContainer.appendChild(menuTagContainer);
        menuTagContainer.classList.add(
          'menu-tag-container',
          'flex',
          'justify-center',
          'items-center',
          'border-r',
          'px-4',
        
        );
  
        const menuTag = document.createElement('p');
        menuTag.textContent = menu.tag;
        menuTagContainer.appendChild(menuTag);
        menuTag.classList.add(
          'menu-tag'
        );
  
        const menuNameContainer = document.createElement('div');
        menuEintragContainer.appendChild(menuNameContainer);
        menuNameContainer.classList.add(
          'menu-name-container',
          'flex',
          'justify-center',
          'items-center',
          'border-r',
          'px-4'
        );
  
  
        const menuNameParagraph = document.createElement('p');
        menuNameContainer.appendChild(menuNameParagraph);
        menuNameParagraph.innerText = menu.name;
        menuNameParagraph.classList.add(
          'menu-name-paragraph',
          'pr-4'
        );
  
  
        const menuZutatenContainer = document.createElement('div');
        menuEintragContainer.appendChild(menuZutatenContainer);
        menuZutatenContainer.classList.add(
          'menu-zutaten-container',
          'px-4',
          'flex',
        );
  

        const zutatenListeContainer = document.createElement('div');
        zutatenListeContainer.classList.add(
          'zutaten-liste-container',
          'flex',
          'items-center',
          'justify-center'
        );
        menuZutatenContainer.appendChild(zutatenListeContainer);
  
        const zutatenListe = document.createElement('ul');
        zutatenListeContainer.appendChild(zutatenListe);

  
        menu.zutaten.forEach((zutat) => {
          const zutatenListeEintrag = document.createElement('li');
          zutatenListeEintrag.innerText = `${zutat.produktName}: ${zutat.menge}`;
          zutatenListe.appendChild(zutatenListeEintrag);
      
          //wird abgeglichen ob das Produkt im Menuplan ein ähnlichesProudkt, gleichesProdukt oder ein nichtGefundenesProdukt ist.
          let ähnlicheProdukte = abgeglicheneProdukte.gefundeneProdukte.filter((gefundenesProdukt) => {
            return gefundenesProdukt.zutatStatus === 'ähnlich' && gefundenesProdukt.menuZutatName === zutat.produktName;
          })

          let gleicheProdukte = abgeglicheneProdukte.gefundeneProdukte.filter((gefundenesProdukt) => {
            return gefundenesProdukt.zutatStatus === 'gleich' && gefundenesProdukt.menuZutatName === zutat.produktName;
          })  

          let nichtGefundeneProdukte = abgeglicheneProdukte.nichtGefundeneProdukte.filter((nichtGefundenesProdukt) => {
            return nichtGefundenesProdukt.menuZutatName === zutat.produktName;
          })

          if (ähnlicheProdukte) {
            ähnlicheProdukte.forEach((ähnlichesProdukt) => {
              const häckchenBtnContainer = document.createElement('div');
              const häckchenBtn = document.createElement('button');
              häckchenBtnContainer.dataset.id = ähnlichesProdukt.id;
              häckchenBtn.dataset.id = ähnlichesProdukt.id;
              häckchenBtn.innerHTML = `<svg class="transition ease-in-out delay-50 duration-200 hover:fill-green-600 hover:scale-125" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"  fill="#4ADE80"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>`
              häckchenBtnContainer.appendChild(häckchenBtn);
              zutatenListeEintrag.appendChild(häckchenBtnContainer);
              häckchenBtnContainer.classList.add(
                'flex',
                'items-center',
                'justify-center',
                'ml-2',
                'mr-1'
              )
      
              const kreuzBtnContainer = document.createElement('div');
              const kreuzBtn = document.createElement('button');
              kreuzBtnContainer.dataset.id = ähnlichesProdukt.id;
              kreuzBtn.dataset.id = ähnlichesProdukt.id;
              kreuzBtn.innerHTML = `<svg class="transition ease-in-out delay-50 duration-200 hover:fill-red-700 hover:scale-125" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#F50538"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>`
              kreuzBtnContainer.appendChild(kreuzBtn);
              zutatenListeEintrag.appendChild(kreuzBtnContainer);
              kreuzBtnContainer.classList.add(
                'flex',
                'items-center',
                'justify-center'
              )
              //überprüft ob das ähnlicheProdukt bereits in die Einkaufsliste aufgenommen wurde
              let produktBereitsInEk = provEinkaufsliste.ähnlicheProdukte.original.find((p) => {
                return p.id === ähnlichesProdukt.id;
              }) ||
              provEinkaufsliste.ähnlicheProdukte.umgewandelteProdukte.find((p) => {
                return p.id === ähnlichesProdukt.id;
              })

              //fals das Produkt bereits in Ek zugefüge worden ist, sollen Btn's nicht mehr angezeigt werden.
              if(produktBereitsInEk) {
                häckchenBtnContainer.classList.add('hidden')
                kreuzBtnContainer.classList.add('hidden')
              }

              const popup = document.createElement('div');
              zutatenListeEintrag.appendChild(popup);
              popup.classList.add(
                'hidden',
                'absolute',
                'top-6',
                'z-50',
                'p-2',
                'border-black',
                'border-2',
                'bg-gray-800',
                'text-white',
                'rounded',
                'w-max'
              )

              const popupText = document.createElement('paragraph');
              popup.appendChild(popupText);
              popupText.classList.add('popup-text')


              zutatenListeEintrag.classList.add(
                'flex',
                'items-center',
                'justify-center',
                'relative',
                'text-orange-400'
              )

              zutatenListeEintrag.addEventListener('mouseover', () => {
                popupText.textContent = `Ähnliches Produkt: ${ähnlichesProdukt.description}`;
                popup.classList.remove('hidden');
              });

              zutatenListeEintrag.addEventListener('mouseout', () => {
                popup.classList.add('hidden');
              });


              häckchenBtn.addEventListener('click', (event) => {
                let node = event.target;
                while (node.nodeName.toLowerCase() !== 'button') {
                  node = node.parentNode;
                }
                const id = node.dataset.id.toString();
                const produkt = abgeglicheneProdukte.gefundeneProdukte.find(abgeglichenesProdukt => abgeglichenesProdukt.id === id);

                Swal.fire({
                  title: "Sind Sie sicher?",
                  html: `Wollen Sie dieses Produkt als <b>"${produkt.menuZutatName}"</b> in der Einkaufsliste speichern?`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Ja"
                }).then((result) => {
                  if (result.isConfirmed) {
                    Swal.fire({
                      title: "Gespeichert!",
                      html: `<b>"${produkt.menuZutatName}"</b> wurde in die Einkaufsliste aufgenommen`,
                      icon: "success"
                    });
                    provEinkaufsliste.ähnlicheProdukte.original.push({...produkt, einkaufslisteName: produkt.menuZutatName, einkaufslisteMenge: ''}); 
                    zutatenListeEintrag.classList.remove('flex')
                    häckchenBtnContainer.classList.add('hidden')
                    kreuzBtnContainer.classList.add('hidden')
                    saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);
                    console.log(provEinkaufsliste)

                  }
                });
              })

              kreuzBtn.addEventListener('click', (event) => {
                let node = event.target;
                while (node.nodeName.toLowerCase() !== 'button') {
                  node = node.parentNode;
                }

                const id = node.dataset.id.toString();
                const produkt = abgeglicheneProdukte.gefundeneProdukte.find(abgeglichenesProdukt => abgeglichenesProdukt.id === id);

                Swal.fire({
                  title: "Sind Sie sicher?",
                  html: `Ein ähnliches Produkt ist bereits im Bestand vorhanden. Wollen Sie deshalb statt <b>"${produkt.menuZutatName}"</b>, <b>"${produkt.description}"</b> zur Einkaufsliste zufügen?`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Ja"
                }).then((result) => {
                  if (result.isConfirmed) {
                    Swal.fire({
                      title: "Gespeichert!",
                      html: `<b>"${produkt.description}"</b> wurde in die Einkaufsliste aufgenommen`,
                      icon: "success"
                    });
                    provEinkaufsliste.ähnlicheProdukte.umgewandelteProdukte.push({...produkt, einkaufslisteName: produkt.description, einkaufslisteMenge: ''}); 
                    zutatenListeEintrag.classList.remove('flex')
                    häckchenBtnContainer.classList.add('hidden')
                    kreuzBtnContainer.classList.add('hidden')
                    saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);
                  }
                });
              })
            })
          /*} else if (gleicheProdukte) {
            zutatenListeEintrag.classList.add(
              'text-green-300'
            )

            gleicheProdukte.forEach((gleichesProdukt) => {
              //überprüft ob das gleicheProdukt bereits in die Einkaufsliste aufgenommen wurde
              let produktBereitsInEk = provEinkaufsliste.gleicheProdukte.find((p) => {
                return p.id === gleichesProdukt.id;
              })
              //fals das Produkt bereits in Ek zugefüge worden ist, wird es nicht nochmals zur Ek zugefügt.
              if(!produktBereitsInEk) {
                provEinkaufsliste.gleicheProdukte.push({...gleichesProdukt, einkaufslisteName: zutat.produktName, einkaufslisteMenge: ''})
                saveProvEinkaufslisteToLocalStorage();  
              }  
            })
            */

          /*} else {
            //überprüft ob das nichtGefundeneProdukt bereits in die Einkaufsliste aufgenommen wurde
            let produktBereitsInEk = provEinkaufsliste.nichtGefundeneProdukte.find((p) => {
              return p.id === nichtGefundenesProdukt.id;
            })
            //fals das Produkt bereits in Ek zugefügt worden ist, wird es nicht nochnmals zugefügt
            if(!produktBereitsInEk) {
              provEinkaufsliste.nichtGefundeneProdukte.push({...nichtGefundenesProdukt, einkaufslisteName: zutat.produktName, einkaufslisteMenge: ''})
              saveProvEinkaufslisteToLocalStorage();
            }*/
          }

          if (gleicheProdukte) {
            zutatenListeEintrag.classList.add('text-green-300')
            gleicheProdukte.forEach((gleichesProdukt) => {
              //überprüft ob das gleicheProdukt bereits in die Einkaufsliste aufgenommen wurde
              let produktBereitsInEk = provEinkaufsliste.gleicheProdukte.find((p) => {
                return p.id === gleichesProdukt.id;
              })
              console.log(zutat)

              //fals das Produkt bereits in Ek zugefüge worden ist, wird es nicht nochmals zur Ek zugefügt.
              if(!produktBereitsInEk) {
                provEinkaufsliste.gleicheProdukte.push({...gleichesProdukt, einkaufslisteName: gleichesProdukt.description, einkaufslisteMenge: ''})
                saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);  
              }  
            })
          }
          if (nichtGefundeneProdukte) {
            nichtGefundeneProdukte.forEach((nichtGefundenesProdukt) => {
              zutatenListeEintrag.classList.add('text-white')
              //überprüft ob das nichtGefundeneProdukt bereits in die Einkaufsliste aufgenommen wurde
              let produktBereitsInEk = provEinkaufsliste.nichtGefundeneProdukte.find((p) => {
                return p.id === nichtGefundenesProdukt.id;
              })
              //fals das Produkt bereits in Ek zugefügt worden ist, wird es nicht nochnmals zugefügt
              if(!produktBereitsInEk) {
                provEinkaufsliste.nichtGefundeneProdukte.push({...nichtGefundenesProdukt, einkaufslisteName: zutat.produktName, einkaufslisteMenge: ''})
                saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);
              }
            })
          }
        })
      } 
    })
  })
/*
  const generiereEinkaufslisteBtn = document.createElement('a');
  generiereEinkaufslisteBtn.href = "Einkaufsliste.html";
  generiereEinkaufslisteBtn.classList.add(
    'w-full',
    'h-min'
  )
*/
  const generiereEinkaufslisteBtn = document.createElement('button');
  //provEinkaufslisteContainer.appendChild(generiereEinkaufslisteBtn);
  generiereEinkaufslisteBtn.innerText = 'generiere Einkaufsliste'
  generiereEinkaufslisteBtn.classList.add(
    'bg-green-400',
    'mt-10',
    'w-full',
    'rounded',
    'hover:bg-green-600',
    'p-2',
    'font-semibold',
    'text-center'
  )

  //check ob der benutzer alle ähnlichenProdukte schon geprüft hat. 
  //menge1 (die menge der Menüpläne produkte) muss gleich mit menge2 (menge der Produkte in der ProvEinkaufsliste) sein
  generiereEinkaufslisteBtn.addEventListener('click', () => {
    let menge1 = 0;
    console.log(provEinkaufsliste)
    menuPläne.forEach((menuPlan) => {
      menuPlan.forEach((menu) => {
        menge1 += menu.zutaten.length
      })
    })
    
    let menge2 = 0
    Object.values(provEinkaufsliste).forEach((value) => {
      if (Array.isArray(value)) {
        menge2 += value.length
      } else {
        Object.values(value).forEach((v) => {
          if (v.length) {
            menge2 += v.length
          }
        })
      }
    })
    
    if(menge1 !== menge2) {
      Swal.fire({
        title: "Fehlende Eingaben",
        text: "Bitte prüfen Sie zuerst alle ähnlichen Produkte bevor Sie die Einkaufsliste erstellen",
        icon: "error"
      });
    } else {
      //generiereEinkaufslisteBtn.href = "Einkaufsliste.html";
      window.open('Einkaufsliste.html');
    }
  })

  //fehlermeldung da der benutzer noch nichts in die menupläne eingetragen hat, somit ist auch die ProvEinkaufsliste leer.
  if(istProvEinkaufslisteVoll(provEinkaufsliste) === 0) {
    entblockLinks();
    provEinkaufslisteContainer.classList.add('hidden')

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
      'mx-2'
    );

    const infoText = document.createElement('p');
    infoText.classList.add(
    );
    infoText.innerHTML = `
    <p class="text-xl font-semibold text-red-500">Deine provisorische Einkaufsliste ist leer.</p><br>
    <p>Es scheint so, also ob Ihre Menupläne noch leer sind.</p>
    <p>Tragen Sie zuerst Menus und deren Zutaten in die Menulisten ein bevor Sie eine Einkaufsliste erstellen.</p>
    `;
    infoDiv.appendChild(infoText)
    document.body.appendChild(infoDiv)

  } 
  provEinkaufslisteContainer.appendChild(generiereEinkaufslisteBtn);
}
//renderProvEinkaufsliste(await produkteUndZutatenAbgleichen(getMenuPläneFromLocalStorage(), erstelleAktualisiertenBestand()));



function istProvEinkaufslisteVoll(provEinkaufsliste) {
  let menge = 0;

  Object.values(provEinkaufsliste).forEach((value) => {
    if (Array.isArray(value)) {
      menge += value.length
    } else {
      Object.values(value).forEach((v) => {
        if (v.length) {
          menge += v.length
        }
      })
    }
  })

  return menge;
}