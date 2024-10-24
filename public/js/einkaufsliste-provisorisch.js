import { fetchSynonyms } from '../../api/fetchSynonyms.js';
import { fetchTranslation, detectLanguage } from '../../api/googleTranslation.js';
import { vergleicheEigenschaften, vergleicheUnterschiedlicheEigenschaften, formatiereString, istGültig, generiereId } from './utils.js';


class ProvEinkaufsliste {
  constructor() {
    window.onload = async() => {
      console.log(
        await this.produkteUndZutatenAbgleichen(this.loadMenüpläneFromLocalStorage(), this.loadBestandFromLocalStorage())
      )
      this.abgeglicheneProdukte = await this.produkteUndZutatenAbgleichen(this.loadMenüpläneFromLocalStorage(), this.loadBestandFromLocalStorage());    
      console.log('test3')
      this.renderProvEinkaufsliste();
    }
  }

  
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
    localStorage.setItem(bestand, JSON.stringify('bestand'));
  }

  
  loadMenüpläneFromLocalStorage() {
    let menuPläne = [];

    const morgenessenMenuPlan = localStorage.getItem('morgenessenMenüs');
    const mittagessenMenuPlan = localStorage.getItem('mittagessenMenüs');
    const abendessenMenuPlan = localStorage.getItem('abendessenMenüs');
    
    
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
      console.log(provEinkaufsliste)
    }
    return provEinkaufsliste;
  }



  saveProvEinkaufslisteToLocalStorage(provEinkaufsliste) {
    localStorage.setItem('provEinkaufsliste', JSON.stringify(provEinkaufsliste))
  }
  
  
  //blocked dass man auf andere Seiten kommen kann. Sonst ist es möglich die Prov-einkaufsliste zu übersprinen. Dies ist möglich wenn zuerst auf Prov-einkaufsliste -> dann auf anderer seite (z.b Bestand) und dann klickt man direkt auf Einkaufsliste was dazu führt das diese geöfnet wird und Einkaufsliste anzeigt
  blockLinks() {
    const links = document.getElementsByTagName('a');
    //gibt HTML Collection zurück und kein Array, deshalb kein forEach möglich
    for (let i = 0; i < links.length; i++) {
      links[i].classList.add('pointer-events-none');
    }
  }
  
  entblockLinks() {
    const links = document.getElementsByTagName('a');
  
    for (let i = 0; i < links.length; i++) {
      links[i].classList.add('pointer-events-auto');
    }
  }
  
  
  erstelleAktualisiertenBestand() {
    let aktualisierterBestand = [];
    let bestand = this.loadBestandFromLocalStorage();
    let verbrauch = loadVerbrauchFromLocalStorage();
    
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


  
  //Für jedes Produkt in den menüplänen werden eine Übersetzung und diverse Synonyme erstellt.
  //Diese werden dann mit dem BEstand abgeglichen um herauszufinden ob allenfalls schon gleiche Produkte im Bestand enthalten sind.
  //Hauptsächlich eine vorsichtsmassnahme da es ja möglich ist dass ein produkt in einer anderen sprache schon vorhanden ist oder das

  //jemand tomaten für ein salat braucht aber noch cherrytomaten hat und es dann unnötig wäre nochmals einzukaufen.
  async produkteUndZutatenAbgleichen(menüpläne, bestand) {
    const abgeglicheneProdukte =  {
      gefundeneProdukte: [],
      nichtGefundeneProdukte: []
    };

    for (const menuPlan of menüpläne) {
      for (const menu of menuPlan) {
        for (const menuZutat of menu.zutaten) {
          try {
            const menuZutatName = menuZutat.produktName.toLowerCase();
            const sprache = await detectLanguage(menuZutatName);


            //'bprodukt' === 'menuZutat'
            let ProduktEnthaltenImBestand = bestand.find(bestandsprodukt =>
              bestandsprodukt.description?.toLowerCase() === menuZutatName && istGültig(bestandsprodukt.description, menuZutatName) ||
              bestandsprodukt.title?.toLowerCase() === menuZutatName && istGültig(bestandsprodukt.title, menuZutatName)
            );

            if (ProduktEnthaltenImBestand) {
              abgeglicheneProdukte.gefundeneProdukte.push({ ...ProduktEnthaltenImBestand, id: generiereId(), menuZutatName: menuZutat.produktName.toLowerCase(), menuMenge: menuZutat.menge, zutatStatus: "gleich"});
              continue;
            }


            //'Bestandproudkt' === 'übersetuung'
            let übersetzung;
            if (sprache !== 'de') {
              const translationData = await fetchTranslation(menuZutatName, 'de');
              übersetzung = translationData.translations[0]?.toLowerCase() || menuZutatName;  
            }
            let ÜbersetzungEnthaltenImBestand = bestand.find(bestandsprodukt =>
              bestandsprodukt.description?.toLowerCase() === übersetzung && istGültig(bestandsprodukt.description, übersetzung) ||
              bestandsprodukt.title?.toLowerCase() === übersetzung && istGültig(bestandsprodukt.title, übersetzung)
            );

            if (ÜbersetzungEnthaltenImBestand) {
              abgeglicheneProdukte.gefundeneProdukte.push({ ...ÜbersetzungEnthaltenImBestand, id: generiereId(), menuZutatName: menuZutat.produktName.toLowerCase(), menuMenge: menuZutat.menge, zutatStatus: "ähnlich"});
              continue;
            }
  
            //'synonym' (von übersetzung und von menuZutat original) === 'menuZutat' || 'synonym' === 'übersertzung'
            const übersetzungSynonyme = await fetchSynonyms(übersetzung);
            const produktSynonyme = await fetchSynonyms(menuZutatName);
            const alleSynonyme = [...new Set([...übersetzungSynonyme, ...produktSynonyme])];


            console.log(`
              produktname lautet: '${menuZutatName}'; 
              übersetzung lautet: '${übersetzung}'; 
              synonyme lauten: '${alleSynonyme}'
            `)


            let synonymEnthaltenImBestand;
            for (const synonym of alleSynonyme) {
              synonymEnthaltenImBestand = bestand.find(bestandsprodukt => 
                bestandsprodukt.description?.toLowerCase() === synonym && istGültig(bestandsprodukt.description, synonym) ||
                bestandsprodukt.title?.toLowerCase() === synonym && istGültig(bestandsprodukt.title, synonym)
              );
            }

            if (synonymEnthaltenImBestand) {
              abgeglicheneProdukte.gefundeneProdukte.push({ ...synonymEnthaltenImBestand, id: generiereId(), menuZutatName: menuZutat.produktName.toLowerCase(), menuMenge: menuZutat.menge, zutatStatus: "ähnlich"});
              continue;
            }


            let menuZutatEnthaltenImBestandProdukt;
            let BestandProduktEnthaltenInMenuZutat;

            for (const produkt of bestand) {
              if (produkt.description) {
                if (produkt.description.toLowerCase().includes(menuZutatName.toLowerCase().replace(/\s+/g, ''))) {
                  menuZutatEnthaltenImBestandProdukt = produkt;
                } else if (menuZutatName.toLowerCase().replace(/\s+/g, '').includes(produkt.description.toLowerCase())) {
                  BestandProduktEnthaltenInMenuZutat = produkt;
                }
              } else {
                if (produkt.title.toLowerCase().includes(menuZutatName.toLowerCase().replace(/\s+/g, ''))) {
                  menuZutatEnthaltenImBestandProdukt = produkt;
                } else if (menuZutatName.toLowerCase().replace(/\s+/g, '').includes(produkt.title.toLowerCase())) {
                  BestandProduktEnthaltenInMenuZutat = produkt;
                }
              }
            }
            console.log(menuZutatName.replace(/\s+/g, ''))
            console.log(BestandProduktEnthaltenInMenuZutat)


            if (menuZutatEnthaltenImBestandProdukt){
              abgeglicheneProdukte.gefundeneProdukte.push({ ...menuZutatEnthaltenImBestandProdukt, id: generiereId(), menuZutatName: menuZutat.produktName.toLowerCase(), menuMenge: menuZutat.menge, zutatStatus: "ähnlich"});
              continue;
            }
            
            if (BestandProduktEnthaltenInMenuZutat) {
              abgeglicheneProdukte.gefundeneProdukte.push({ ...BestandProduktEnthaltenInMenuZutat, id: generiereId(), menuZutatName: menuZutat.produktName.toLowerCase(), menuMenge: menuZutat.menge, zutatStatus: "ähnlich"});
              continue;
            }



            let übersetzungEnthaltenImBestandProdukt;
            let BestandProduktEnthaltenInÜbersetzung;

            //wenn das 
            if (übersetzung) {
              for (const produkt of bestand) {
                if (produkt.description) {
                  if (produkt.description.toLowerCase().includes(übersetzung.toLowerCase().replace(/\s+/g, ''))) {
                    übersetzungEnthaltenImBestandProdukt = produkt;
                  } else if (übersetzung.toLowerCase().replace(/\s+/g, '').includes(produkt.description.toLowerCase())) {
                    BestandProduktEnthaltenInÜbersetzung = produkt;
                  }
                } else {
                  if (produkt.title.toLowerCase().includes(übersetzung.toLowerCase().replace(/\s+/g, ''))) {
                    übersetzungEnthaltenImBestandProdukt = produkt;
                  } else if (übersetzung.toLowerCase().replace(/\s+/g, '').includes(produkt.title.toLowerCase())) {
                    BestandProduktEnthaltenInÜbersetzung = produkt;
                  }
                }
              }
            }

            
            if (übersetzungEnthaltenImBestandProdukt){
              abgeglicheneProdukte.gefundeneProdukte.push({ ...übersetzungEnthaltenImBestandProdukt, id: generiereId(), menuZutatName: menuZutat.produktName.toLowerCase(), menuMenge: menuZutat.menge, zutatStatus: "ähnlich"});
              continue;
            }
            
            if (BestandProduktEnthaltenInÜbersetzung) {
              abgeglicheneProdukte.gefundeneProdukte.push({ ...BestandProduktEnthaltenInÜbersetzung, id: generiereId(), menuZutatName: menuZutat.produktName.toLowerCase(), menuMenge: menuZutat.menge, zutatStatus: "ähnlich"});
              continue;
            }

          
            //wenn keine Übereinstimmung vorliegt wurde das produkt nicht gefunden.
            abgeglicheneProdukte.nichtGefundeneProdukte.push({...menuZutat, menuZutatName: menuZutat.produktName.toLowerCase(), menuMenge: menuZutat.menge, id: generiereId(), übersetzung: übersetzung, synonyme: alleSynonyme} )
            
          } catch (error) {
            console.error('Fehler beim Abrufen von Synonymen:', error);
          }
        }
      }
    }  
    console.log(abgeglicheneProdukte)
    return abgeglicheneProdukte;  
  }

  istMenuplanLeer(menuplan) {
    let istLeer = true;
    menuplan.forEach(menu => {
      if (menu.zutaten.length !== 0) {
        istLeer = false;
      }
    });
    return istLeer;
  }



  renderProvEinkaufsliste() {
    this.blockLinks();
    
    let provEinkaufsliste = {
      gleicheProdukte: [],
      nichtGefundeneProdukte: [],
      ähnlicheProdukte: {
        original: [],
        umgewandelteProdukte: []
      }
    }
    
    const menüpläne = this.loadMenüpläneFromLocalStorage();
    const provEinkaufslisteContainer = document.querySelector('.prov-einkaufsliste-container');
    
   

    provEinkaufslisteContainer.innerHTML = '';
    provEinkaufslisteContainer.classList.add('px-4', 'w-full');
    
    
    menüpläne.forEach((menuPlan, index) => {
      this.renderMenuPlan(menuPlan, index, provEinkaufslisteContainer, provEinkaufsliste);
    });

    console.log(provEinkaufsliste)
    this.addGenerateButton(provEinkaufslisteContainer, menüpläne, provEinkaufsliste);
    this.checkForEmptyProvEinkaufsliste(provEinkaufsliste, provEinkaufslisteContainer);
    this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);
    this.addEventListeners()
  }

  renderMenuPlan(menuPlan, index, container, provEinkaufsliste) {
    if (!this.istMenuplanLeer(menuPlan)) {
      const menuPlanTitleContainer = document.createElement('div');
      const menuPlanTitle = document.createElement('h1');
    
      menuPlanTitleContainer.classList.add('flex', 'items-center', 'justify-center', 'text-white', 'w-full', 'mt-12', 'mb-2');
      menuPlanTitle.classList.add('text-xl', 'font-bold');
    
      if (index === 0) {
        menuPlanTitle.innerText = 'Morgenessen Plan';
      } else if (index === 1) {
        menuPlanTitle.innerText = 'Mittagessen Plan';
      } else if (index === 2) {
        menuPlanTitle.innerText = 'Abendessen Plan';
      }
    
      menuPlanTitleContainer.appendChild(menuPlanTitle);
      container.appendChild(menuPlanTitleContainer);
    

      const menusContainer = document.createElement('div');
      menusContainer.classList.add('menus-container', 'flex', 'flex-col', 'w-full', 'gap-y-3', 'text-white');  
      container.appendChild(menusContainer);

      menuPlan.forEach(menu => {
        this.renderMenu(menu, menusContainer, provEinkaufsliste);
      });
    }
  }

  renderMenu(menu, menusContainer, provEinkaufsliste) {
    if (menu.zutaten.length > 0) {
      const menuEintragContainer = document.createElement('div');
      menusContainer.appendChild(menuEintragContainer);
      menuEintragContainer.classList.add(
        'flex',
        'bg-c2',
        'py-2',
        'rounded-lg',
        'items-center',
        'justify-center'
      );

      const menuTagContainer = document.createElement('div');
      menuEintragContainer.appendChild(menuTagContainer);
      menuTagContainer.classList.add(
        'menu-tag-container',
        'flex',
        'justify-center',
        'items-center',
        'border-r',
        'px-8',
      
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
        'px-8'
      );


      const menuNameParagraph = document.createElement('p');
      menuNameContainer.appendChild(menuNameParagraph);
      menuNameParagraph.innerText = menu.name;
      menuNameParagraph.classList.add(
        'menu-name-paragraph',
      );

      const zutatenListeContainer = document.createElement('div');
      menuEintragContainer.appendChild(zutatenListeContainer);
      zutatenListeContainer.classList.add(
        'zutaten-liste-container',
        'flex',
        'items-center',
        'justify-center',
        'px-8',
        'flex-col'
      );
      
      menu.zutaten.forEach((zutat) => {
        this.renderZutat(zutat, zutatenListeContainer, provEinkaufsliste);
      });
    }
  }

  renderZutat(zutat, zutatenListeContainer, provEinkaufsliste) {
    const zutatenListe = document.createElement('ul');
    zutatenListeContainer.appendChild(zutatenListe);
    
    const zutatenListeEintrag = document.createElement('li');
    zutatenListeEintrag.classList.add('zutaten-liste-eintrag')
    zutatenListeEintrag.innerText = `${zutat.produktName}: ${zutat.menge}`;
    zutatenListe.appendChild(zutatenListeEintrag);
    console.log(zutatenListeEintrag)

    let ähnlicheProdukte = this.abgeglicheneProdukte.gefundeneProdukte.filter(gefundenesProdukt => {
      return gefundenesProdukt.zutatStatus === 'ähnlich' && gefundenesProdukt.menuZutatName === zutat.produktName.toLowerCase()
    });
    console.log(ähnlicheProdukte)
    console.log(this.abgeglicheneProdukte)
    let gleicheProdukte = this.abgeglicheneProdukte.gefundeneProdukte.filter(gefundenesProdukt => {
      return gefundenesProdukt.zutatStatus === 'gleich' && gefundenesProdukt.menuZutatName === zutat.produktName.toLowerCase()
    });

    let nichtGefundeneProdukte = this.abgeglicheneProdukte.nichtGefundeneProdukte.filter(nichtGefundenesProdukt => {
      return nichtGefundenesProdukt.menuZutatName === zutat.produktName.toLowerCase()
    });
    
    if (ähnlicheProdukte) {
      ähnlicheProdukte.forEach(ähnlichesProdukt => {
        this.renderÄhnlichesProdukt(ähnlichesProdukt, zutatenListeEintrag, provEinkaufsliste)
      })
    };

    if (gleicheProdukte) {
      gleicheProdukte.forEach(gleichesProdukt => this.renderGleichesProdukt(gleichesProdukt, zutatenListeEintrag, provEinkaufsliste));
    };
    
    if (nichtGefundeneProdukte) {
      nichtGefundeneProdukte.forEach(nichtGefundenesProdukt => this.renderNichtGefundenesProdukt(zutat, nichtGefundenesProdukt, zutatenListeEintrag, provEinkaufsliste));
    };
    this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste)
  };

  renderÄhnlichesProdukt(ähnlichesProdukt, zutatenListeEintrag, provEinkaufsliste) {
    const häckchenBtnContainer = document.createElement('div');
    const häckchenBtn = document.createElement('button');
    häckchenBtnContainer.dataset.id = ähnlichesProdukt.id;
    häckchenBtn.dataset.id = ähnlichesProdukt.id;
    häckchenBtn.innerHTML = `<svg class="transition ease-in-out delay-50 duration-200 hover:fill-green-600 hover:scale-125" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"  fill="#4ADE80"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>`
    häckchenBtnContainer.appendChild(häckchenBtn);
    zutatenListeEintrag.appendChild(häckchenBtnContainer);
    häckchenBtnContainer.classList.add(
      'häckchen-btn',
      'flex',
      'items-center',
      'justify-center',
      'ml-2',
      'mr-1'
    );

    const kreuzBtnContainer = document.createElement('div');
    const kreuzBtn = document.createElement('button');
    kreuzBtnContainer.dataset.id = ähnlichesProdukt.id;
    kreuzBtn.dataset.id = ähnlichesProdukt.id;
    kreuzBtn.innerHTML = `<svg class="transition ease-in-out delay-50 duration-200 hover:fill-red-700 hover:scale-125" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#F50538"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>`
    kreuzBtnContainer.appendChild(kreuzBtn);
    zutatenListeEintrag.appendChild(kreuzBtnContainer);
    kreuzBtnContainer.classList.add(
      'kreuz-btn',
      'flex',
      'items-center',
      'justify-center'
    );
    
    //überprüft ob das ähnlicheProdukt bereits in die provEinkaufsliste aufgenommen wurde
    //ähnlicheProdukte sind beim ersten laden der provEinkaufsliste noch leer. erst wenn jemand 
    //die häckcen oder kruez btns drückt werden diese definiert.
    let produktBereitsInEk = provEinkaufsliste.ähnlicheProdukte.original.find((p) => {
      return p.id === ähnlichesProdukt.id;
    }) || provEinkaufsliste.ähnlicheProdukte.umgewandelteProdukte.find((p) => {
      return p.id === ähnlichesProdukt.id;
    });

    console.log(produktBereitsInEk)
    //fals das Produkt bereits in provEinkaufliste zugefüge worden ist, sollen Btn's nicht mehr angezeigt werden.
    if(produktBereitsInEk) {
      häckchenBtnContainer.classList.add('hidden');
      kreuzBtnContainer.classList.add('hidden');
      this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);
    };

    const popup = document.createElement('div');
    zutatenListeEintrag.appendChild(popup);
    popup.classList.add(
      'popup',
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
    );

    const popupText = document.createElement('paragraph');
    popup.appendChild(popupText);
    popupText.classList.add('popup-text');
    popupText.innerText = ähnlichesProdukt.description || ähnlichesProdukt.title;


    zutatenListeEintrag.classList.add(
      'flex',
      'items-center',
      'justify-center',
      'relative',
      'text-orange-400'
    );
    this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);
  }

  renderGleichesProdukt(gleichesProdukt, zutatenListeEintrag, provEinkaufsliste) {
    zutatenListeEintrag.classList.add('text-green-300')
    
    //überprüft ob das gleicheProdukt bereits in die Einkaufsliste aufgenommen wurde
    let produktBereitsInEk = provEinkaufsliste.gleicheProdukte.find((p) => {
      return p.id === gleichesProdukt.id;
    })

    //fals das Produkt bereits in Ek zugefüge worden ist, wird es nicht nochmals zur Ek zugefügt.
    if(!produktBereitsInEk) {
      provEinkaufsliste.gleicheProdukte.push({...gleichesProdukt, einkaufslisteName: gleichesProdukt.description || gleichesProdukt.title, einkaufslisteMenge: ''})
      this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);  
    }  
    this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste)
  
  }
  renderNichtGefundenesProdukt(zutat, nichtGefundenesProdukt, zutatenListeEintrag, provEinkaufsliste) {
    zutatenListeEintrag.classList.add('text-white')
    
    
    //überprüft ob das nichtGefundeneProdukt bereits in die provEinkaufsliste aufgenommen wurde
    let produktBereitsInEk = provEinkaufsliste.nichtGefundeneProdukte.find((p) => {
      return p.id === nichtGefundenesProdukt.id;
    })
    //fals das Produkt bereits in provEinkaufsliste zugefügt worden ist, wird es nicht nochnmals zugefügt
    if(!produktBereitsInEk) {
      provEinkaufsliste.nichtGefundeneProdukte.push({...nichtGefundenesProdukt, einkaufslisteName: zutat.produktName.toLowerCase(), einkaufslisteMenge: ''})
      this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);
    }
    this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste)
  }

  addGenerateButton(container, menüpläne, provEinkaufsliste) {
    const generiereEinkaufslisteBtn = document.createElement('button');
    //provEinkaufslisteContainer.appendChild(generiereEinkaufslisteBtn);
    generiereEinkaufslisteBtn.innerText = 'generiere Einkaufsliste';
    container.appendChild(generiereEinkaufslisteBtn);
    generiereEinkaufslisteBtn.classList.add(
      'generiere-einkaufsliste-btn',
      'bg-green-400',
      'mt-10',
      'w-full',
      'rounded',
      'hover:bg-green-600',
      'p-2',
      'font-semibold',
      'text-center'
    )
  }

  //menge1 (die menge der Menüpläne produkte) muss gleich mit menge2 (menge der Produkte in der ProvEinkaufsliste) sein
  isProvEinkaufslisteChecked(menüpläne, provEinkaufsliste) {
    let menge1 = 0;
    console.log(provEinkaufsliste)
    menüpläne.forEach((menuPlan) => {
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
    console.log(menge1)
    console.log(menge2)
    console.log(menge1 === menge2)

    return menge1 === menge2;
  }

  checkForEmptyProvEinkaufsliste(provEinkaufsliste, provEinkaufslisteContainer) {
    if(!this.isProvEinkaufslisteEmpty(provEinkaufsliste)) {
      this.entblockLinks();
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
      <p class="text-xl font-semibold text-red-500">Ihre Menüpläne sind leer.</p><br>
      <p>Es scheint so, also ob Ihre Menüpläne noch leer sind.</p>
      <p>Tragen Sie zuerst Menus und deren Zutaten in die Menulisten ein bevor Sie eine Einkaufsliste erstellen.</p>
      `;
      infoDiv.appendChild(infoText)
      document.body.appendChild(infoDiv)
    } 
  }

  isProvEinkaufslisteEmpty(provEinkaufsliste) {
    let count = 0;
    console.log(provEinkaufsliste)

    Object.values(provEinkaufsliste).forEach((value) => {
      if (Array.isArray(value)) {
        count += value.length
      } else {
        Object.values(value).forEach((v) => {
          if (v.length) {
            count += v.length
          }
        })
      }
    })
    console.log(count)
    return count;
  }


  addEventListeners() {

    const generiereEinkaufslisteBtn = document.querySelector('.generiere-einkaufsliste-btn')
    generiereEinkaufslisteBtn.addEventListener('click', () => {
      const provEinkaufslisteContainer = document.querySelector('.prov-einkaufsliste-container');
      const menüpläne = this.loadMenüpläneFromLocalStorage();
      let provEinkaufsliste = this.loadProvEinkaufslisteFromLocalStorage();

        //check ob der benutzer alle ähnlichenProdukte schon geprüft hat. 
      if(!this.isProvEinkaufslisteChecked(menüpläne, provEinkaufsliste)) {
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


    // Event Listener für die Zutatenliste (ähnliche, gleiche und nicht gefundene Produkte)
    document.querySelectorAll('.zutaten-liste-eintrag').forEach(zutatenEintrag => {
      zutatenEintrag.addEventListener('mouseover', () => {
        const popups = zutatenEintrag.querySelectorAll('.popup');
        popups.forEach((popup) => {
          popup.classList.remove('hidden');
          popup.classList.add('flex');
        })
      });

      zutatenEintrag.addEventListener('mouseout', () => {
        const popups = zutatenEintrag.querySelectorAll('.popup');
        popups.forEach((popup) => {
          popup.classList.add('hidden');
          popup.classList.remove('flex');
        })
      });


      const häckchenBtns = document.querySelectorAll('.häckchen-btn')
      häckchenBtns.forEach((häckchenBtn) => {
        häckchenBtn.addEventListener('click', (event) => {
          let node = event.target;
          while (node.nodeName.toLowerCase() !== 'button') {
            node = node.parentNode;
          };

          const id = node.dataset.id.toString();
          const provEinkaufsliste = this.loadProvEinkaufslisteFromLocalStorage();
          const produkt = this.abgeglicheneProdukte.gefundeneProdukte.find(abgeglichenesProdukt => abgeglichenesProdukt.id === id);
          const zutatenListeEintrag = node.parentElement.parentElement;


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
              provEinkaufsliste.ähnlicheProdukte.original.push({...produkt, einkaufslisteName: produkt.menuZutatName.toLowerCase(), einkaufslisteMenge: ''}); 
              zutatenListeEintrag.classList.remove('flex');
              zutatenListeEintrag.querySelectorAll('div').forEach((div) => {
                div.remove();
              });
              this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);
              console.log(provEinkaufsliste);
  
            }
          });
        });  
      })
      
      const kreuzBtns = document.querySelectorAll('.kreuz-btn');
      kreuzBtns.forEach((kreuzBtn) => {
        kreuzBtn.addEventListener('click', (event) => {
          let node = event.target;
          while (node.nodeName.toLowerCase() !== 'button') {
            node = node.parentNode;
          };
  

          const id = node.dataset.id.toString();
          const provEinkaufsliste = this.loadProvEinkaufslisteFromLocalStorage();
          const produkt = this.abgeglicheneProdukte.gefundeneProdukte.find(abgeglichenesProdukt => abgeglichenesProdukt.id === id);
          const zutatenListeEintrag = node.parentElement.parentElement;

  
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
              provEinkaufsliste.ähnlicheProdukte.umgewandelteProdukte.push({...produkt, einkaufslisteName: produkt.description || produkt.title, einkaufslisteMenge: ''}); 
              zutatenListeEintrag.classList.remove('flex');
              //löscht alle divs, also häckchenBtnContanier und kreuzBtnContaine aus zutatnelisteeintrag
              zutatenListeEintrag.querySelectorAll('div').forEach((div) => {
                div.remove();
              });
              this.saveProvEinkaufslisteToLocalStorage(provEinkaufsliste);
            }
          });
        });
      })
    });
  }
}


const provEinkaufsliste = new ProvEinkaufsliste();

export { provEinkaufsliste, ProvEinkaufsliste }






