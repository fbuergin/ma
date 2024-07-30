export function kreiereMenus(localStorageKey) {
  let zutatenBearbeitenStatus;
  let menuBearbeitenStatus = false;
  let zutatenBearbeitenId;
  let menuPlan;

  console.log(localStorage)



  function saveToLocalStorage() {
    localStorage.setItem(localStorageKey, JSON.stringify(menuPlan));
  }

  function getFromLocalStorage() {
    const savedMenus = localStorage.getItem(localStorageKey);
    if (savedMenus) {
      menuPlan = JSON.parse(savedMenus);
    } else {
      menuPlan = [{
        id: 1,
        tag: 'Montag',
        name: 'Pasta',
        zutaten: []
      }, {
        id: 2,
        tag: 'Dienstag',
        name: '',
        zutaten: []
      }, {
        id: 3,
        tag: 'Mittwoch',
        name: 'Pizza',
        zutaten: [{
          produktName: 'Salami',
          menge: 1,
        }, {
          produktName: 'Mozerella',
          menge: 2,
        }]
      }, {
        id: 4,
        tag: 'Donnerstag',
        name: '',
        zutaten: []
      }, {
        id: 5,
        tag: 'Freitag',
        name: '',
        zutaten: []
      }, {
        id: 6,
        tag: 'Samstag',
        name: '',
        zutaten: []
      }, {
        id: 7,
        tag: 'Sonntag',
        name: '',
        zutaten: []
      }];
    }
  }


  window.onload = function() {
    getFromLocalStorage(); 
    renderMenusFromStock();
    saveToLocalStorage();

  };

  function addMenuToMenus(event) {
    if (event.keyCode === 13) {
      let menuName = event.target.value;
      let menuNameId = event.target.dataset.menunameid;

      event.target.classList.add(
        'hidden'
      )

      document.querySelectorAll('.menu-name-paragraph').forEach((reihe) => {
        if (reihe.dataset.reiheid === menuNameId) {
          reihe.innerHTML += menuName;
        }
      })

      let index = menuPlan.findIndex(menu => menu.id === Number(menuNameId));
      menuPlan[index].name = menuName;

      renderMenusFromStock();
      saveToLocalStorage();
    }
  }


  function addZutatenToMenus(event) {
    let zutatName = event.target.value; 
    let zutatNameId = event.target.dataset.zutatenid;
    let mengeInput = document.querySelector(`.menge-input-${zutatNameId}`);
    let menge = mengeInput.value;
    if (event.keyCode === 13) {
      if (!menge) {
        Swal.fire({
          title: "Hinweis",
          text: 'Bitte geben Sie eine Menge an, bevor Sie fortfahren und "Enter" drücken.',
          icon: "info",
        });
        return;
      }

      let index = menuPlan.findIndex(menu => menu.id === Number(zutatNameId));
      menuPlan[index].zutaten.push({ produktName: zutatName, menge: menge });
      event.target.value = '';
      mengeInput.value = '';

      renderMenusFromStock();
      saveToLocalStorage();
    }
  }

  function addMengeToMenus(event) {
    if (event.keyCode === 13) {
      console.log(zutatenBearbeitenStatus)

      let menge = event.target.value;
      let mengeId = event.target.dataset.mengeid;
      let zutatenInput = document.querySelector(`.zutaten-input-${mengeId}`);
      const button = document.querySelector(`.weitere-zutaten-${mengeId}`);
      const zutatenListe = document.querySelector(`.zutaten-liste-${mengeId}`);

      if (!zutatenInput.value) {
        Swal.fire({
          title: "Hinweis",
          text: 'Bitte geben Sie noch den Namen der Zutat ein, bevor Sie fortfahren und "Enter" drücken.',
          icon: "info",
        });
        return;
      } else if (!menge) {
        Swal.fire({
          title: "Hinweis",
          text: 'Bitte geben Sie eine Menge an, bevor Sie fortfahren und "Enter" drücken.',
          icon: "info",
        });
        return;
      }

      const zutatName = zutatenInput.value;

      event.target.classList.add('hidden');
      zutatenInput.classList.add('hidden');
      button.classList.add('block');


      let index = menuPlan.findIndex(menu => menu.id === Number(mengeId));
      let zutatIndex = menuPlan[index].zutaten.length;

      menuPlan[index].zutaten.push({produktName: zutatName, menge: menge});

    
      zutatenListe.classList.add('zutaten-reihe')
      zutatenListe.innerHTML += menuPlan[index].zutaten[zutatIndex].produktName + ': ' + menge + ', ';

      renderMenusFromStock();
      console.log('addMengeToMenus')
      console.log(zutatenBearbeitenStatus)
      saveToLocalStorage();

    }
  }




  function addWeitereZutaten(event) {
    if(zutatenBearbeitenStatus) {
      Swal.fire({
        title: "Hinweis",
        text: 'Speichern Sie zuerst die aktuelle Bearbeitung, indem Sie "√" drücken bevor, Sie weitere Zutaten anfügen.',
        icon: "info",
      });
      return;

    } else {
      const id = event.target.dataset.reiheid;

      const zutatenInput = document.querySelector(`.zutaten-input-${id}`);
      const mengeInput = document.querySelector(`.menge-input-${id}`);
      const zutatenListe = document.querySelector(`.zutaten-liste-${id}`);
      const weitereZutatenBtn = document.querySelector(`.weitere-zutaten-${id}`);
      const zutatenContainer = document.querySelector(`.menu-zutaten-container-${id}`);
      const bearbeitungsBtn = document.querySelector(`.zutaten-bearbeitungs-btn-${id}`);

      zutatenContainer.classList.add('flex');

      zutatenInput.classList.remove('hidden');
      mengeInput.classList.remove('hidden');

      zutatenInput.classList.add('block');
      mengeInput.classList.add('block');
      zutatenListe.classList.add('hidden');
      weitereZutatenBtn.classList.add('hidden');
      bearbeitungsBtn.classList.add('hidden');

      zutatenInput.value = ''; 
      mengeInput.value = '';

      saveToLocalStorage();
    }
  }




  function zutatAnfügen(index, id) {
    const menu = menuPlan.find(menu => menu.id === id)
    const zutat = menu.zutaten[index]

    zutat.menge ++;
    renderMenusFromStock();
    saveToLocalStorage();
  }

  function zutatEntfernen(index, id) {
    const menu = menuPlan.find(menu => menu.id === id)
    const zutat = menu.zutaten[index]

    if (zutat.menge > 1) {
      zutat.menge --;
    } else {
      menu.zutaten.splice(index, 1)

      if (menu.zutaten.length === 0) {
        zutatenBearbeitenStatus = false;
        zutatenBearbeitenId = null;
      }  
    }

    renderMenusFromStock();
    saveToLocalStorage();
  }

  function menuBearbeiten(event) {
    const id = event.target.dataset.bearbeitungsid;
    const zutatenInput = document.querySelector(`.zutaten-input-${id}`)
    const mengeInput = document.querySelector(`.menge-input-${id}`)

    menuBearbeitenStatus = true;
    menuPlan[id -1].name = ''

    event.target.textContent = 'Speichern'

    saveToLocalStorage();
    renderMenusFromStock();
  
  }



  function zutatenBearbeiten(event) {
    const id = event.target.dataset.bearbeitungsid;
    const plusBtns = document.querySelectorAll(`.plus-btn-${id}`);
    const minusBtns = document.querySelectorAll(`.minus-btn-${id}`);
    const bearbeitungsBtn = document.querySelector(`.zutaten-bearbeitungs-btn-${id}`)

    zutatenBearbeitenId = id;
  
    plusBtns.forEach(btn => btn.classList.remove('hidden'));
    minusBtns.forEach(btn => btn.classList.remove('hidden'));
  
    bearbeitungsBtn.innerHTML = `<svg class="hover:fill-green-600" data-bearbeitungsid="${id}"  xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#4ADE80"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>`;
    
    zutatenBearbeitenStatus = true;
  }
  
  function zutatenBearbeitungSpeichern(event) {
    if (zutatenBearbeitenStatus) {
      const id = event.target.dataset.bearbeitungsid;
      const plusBtns = document.querySelectorAll(`.plus-btn-${id}`);
      const minusBtns = document.querySelectorAll(`.minus-btn-${id}`);
      const speicherBtn = document.querySelector(`.zutaten-bearbeitungs-btn-${id}`);
  
      plusBtns.forEach(btn => btn.classList.add('hidden'));
      minusBtns.forEach(btn => btn.classList.add('hidden'));
  
      speicherBtn.innerHTML = `<svg class="hover:fill-green-600" data-bearbeitungsid="${id}" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"  fill="#4ADE80"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`;
      zutatenBearbeitenStatus = false;
    }
  }
  

  function renderMenusFromStock() {
    const testBtn = document.createElement('button');
    testBtn.classList.add(
      'bg-white',
      'h-6',
      'w-6'
    );
    testBtn.addEventListener('click', (event) => {
      console.log(zutatenBearbeitenStatus);

    })
    
    const menusContainer = document.querySelector('.menus-container');
    menusContainer.innerHTML = '';
    menusContainer.appendChild(testBtn);

    menuPlan.forEach(menu => {
      const menuEintragContainer = document.createElement('div');
      menusContainer.appendChild(menuEintragContainer);
      menuEintragContainer.classList.add(
        `menu-eintrag-container-${menu.id}`,
        'flex',
        'ml-7',
        'bg-c2',
        'py-2',
        'rounded-lg'
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
      menuNameContainer.dataset.reiheid = menu.id;
      menuEintragContainer.appendChild(menuNameContainer);
      menuNameContainer.classList.add(
        `menu-name-container-${menu.id}`,
        'menu-name-container',
        'flex',
        'justify-center',
        'items-center',
        'border-r',
        'px-4'
      );

      const menuNameInput = document.createElement('input');
      menuNameInput.type = 'text';
      menuNameInput.placeholder = 'Menu';
      menuNameInput.dataset.menunameid = menu.id;
      menuNameContainer.appendChild(menuNameInput);
      menuNameInput.classList.add(
        'px-4',
        'py-1',
        'rounded',
        'bg-gray-600',
        'border',
        'border-neutral-800'

      );

      const menuNameParagraph = document.createElement('p');
      menuNameContainer.appendChild(menuNameParagraph);
      menuNameParagraph.classList.add(
        `menu-name-paragraph-${menu.id}`,
        'menu-name-paragraph',
        'pr-4'
      );

      const menuBearbeitungsBtn = document.createElement('button');
      menuBearbeitungsBtn.innerHTML = `<svg class="hover:fill-green-600" data-bearbeitungsid="${menu.id}" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"  fill="#4ADE80"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`;
      menuBearbeitungsBtn.dataset.bearbeitungsid = menu.id;
      menuNameContainer.appendChild(menuBearbeitungsBtn);
      menuBearbeitungsBtn.classList.add(
        `menu-bearbeitungs-btn-${menu.id}`,
        'menu-bearbeitungs-btn'
      );


      const menuZutatenContainer = document.createElement('div');
      menuZutatenContainer.dataset.reiheid = menu.id;
      menuEintragContainer.appendChild(menuZutatenContainer);
      menuZutatenContainer.classList.add(
        `menu-zutaten-container-${menu.id}`,
        'menu-zutaten-container',
        'px-4',
        'flex',
      );


      const inputContainer = document.createElement('div');
      menuZutatenContainer.appendChild(inputContainer);
      inputContainer.classList.add(
        'input-container',
        'flex'
      );


      const zutatenInput = document.createElement('input');
      zutatenInput.type = 'text';
      zutatenInput.dataset.zutatenid = menu.id;
      zutatenInput.placeholder = 'Zutaten';
      inputContainer.appendChild(zutatenInput);
      zutatenInput.classList.add(
        `zutaten-input-${menu.id}`, 
        'zutaten-input',
        'mr-2',
        'px-4',
        'py-1',
        'rounded',
        'bg-gray-600',
        'border',
        'border-neutral-800'
      );


      const mengeInput = document.createElement('input');
      mengeInput.type = 'text';
      mengeInput.placeholder = 'Menge';
      mengeInput.dataset.mengeid = menu.id;
      inputContainer.appendChild(mengeInput);
      mengeInput.classList.add(
        'menge-input', 
        `menge-input-${menu.id}`,
        'mr-2',
        'px-4',
        'py-1',
        'rounded',
        'bg-gray-600',
        'border',
        'border-neutral-800'
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
      zutatenListe.classList.add(`zutaten-liste-${menu.id}`);
      zutatenListeContainer.appendChild(zutatenListe);


      const weitereZutatenContainer = document.createElement('div');
      menuZutatenContainer.appendChild(weitereZutatenContainer);
      weitereZutatenContainer.classList.add(
        'weitere-zutaten-container', 
        'flex', 
        'items-center',
        'justify-center',
        'm-4'
      ); 


      const weitereZutatenBtn = document.createElement('button');
      weitereZutatenBtn.innerHTML = `<svg class="hover:fill-green-600" data-reiheid="${menu.id}" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#4ADE80"><path d="M640-121v-120H520v-80h120v-120h80v120h120v80H720v120h-80ZM160-240v-80h283q-3 21-2.5 40t3.5 40H160Zm0-160v-80h386q-23 16-41.5 36T472-400H160Zm0-160v-80h600v80H160Zm0-160v-80h600v80H160Z"/></svg>`;
      weitereZutatenBtn.dataset.reiheid = menu.id;
      weitereZutatenBtn.addEventListener('click', (event) => {
        addWeitereZutaten(event);
      });
      weitereZutatenContainer.appendChild(weitereZutatenBtn);
      weitereZutatenBtn.classList.add(
        `weitere-zutaten-${menu.id}`, 
        'weitere-zutaten',
        'hidden',
        'h-6',
        'w-6',
      );      


      const zutatenBearbeitungsContanier = document.createElement('div')
      menuZutatenContainer.appendChild(zutatenBearbeitungsContanier);
      zutatenBearbeitungsContanier.classList.add(
        'flex',
        'justify-center',
        'items-center'
      )

      const zutatenBearbeitungsBtn = document.createElement('button');
      zutatenBearbeitungsBtn.classList.add(
        `zutaten-bearbeitungs-btn-${menu.id}`,
        'zutaten-bearbeitungs-btn'
      );
      zutatenBearbeitungsBtn.innerHTML = `<svg class="hover:fill-green-600" data-bearbeitungsid="${menu.id}"  xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"  fill="#4ADE80"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`;
      zutatenBearbeitungsBtn.dataset.bearbeitungsid = menu.id;
      zutatenBearbeitungsContanier.appendChild(zutatenBearbeitungsBtn);
      zutatenBearbeitungsBtn.addEventListener('click', (event) => {
        if (!zutatenBearbeitenStatus) {
          zutatenBearbeiten(event);

        } else if (event.target.parentElement.dataset.bearbeitungsid !== zutatenBearbeitenId){
          Swal.fire({
            title: "Hinweis",
            text: 'Speichern Sie zuerst die aktuelle Bearbeitung, indem Sie "√" drücken bevor, Sie weitere Zutaten bearbeiten.',
            icon: "info",
          });
        } else {
          zutatenBearbeitungSpeichern(event);
        }
      });
     



      if (menu.name) {
        menuNameParagraph.innerHTML += menu.name;

        menuNameInput.classList.add('hidden');
        menuBearbeitungsBtn.classList.add('block');
      } else {
          menuNameInput.classList.add('block');
          menuBearbeitungsBtn.classList.add('hidden');
      }


      if (menu.zutaten.length > 0) {
        zutatenInput.classList.add('hidden');
        mengeInput.classList.add('hidden');
        zutatenListeContainer.classList.add('block');

        const zutatenListeElement = document.querySelector(`.zutaten-liste-${menu.id}`);

        menu.zutaten.forEach((zutat, index) => {
          const zutatenListenEintrag = document.createElement('li');
          zutatenListenEintrag.classList.add(
            `zutaten-liste-eintrag-${menu.id}`,
            'zutaten-liste-eintrag',
            'flex',
            'items-center',
            'justify-center'
          )
          zutatenListenEintrag.textContent = `${zutat.produktName}: ${zutat.menge}`;
          zutatenListeElement.appendChild(zutatenListenEintrag);


          const plusBtn = document.createElement('button');
          const minusBtn = document.createElement('button');
          plusBtn.innerHTML = `<svg class="transition ease-in-out delay-50 duration-200 hover:fill-green-600 hover:w-6 hover:h-6" xmlns="http://www.w3.org/2000/svg" height="15" viewBox="0 -960 960 960" width="15" fill="#4ADE80"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>`;
          minusBtn.innerHTML = `<svg class="transition ease-in-out delay-50 duration-200 hover:fill-red-700 hover:w-6 hover:h-6" xmlns="http://www.w3.org/2000/svg" height="15" viewBox="0 -960 960 960" width="15" fill="#F50538"><path d="M200-440v-80h560v80H200Z"/></svg>`;
          plusBtn.classList.add(
            `plus-btn-${menu.id}`,
            'plus-btn',
            'flex',
            'items-center',
            'justify-center',
            'h-5',
            'w-5',
            'ml-2',
          );

          minusBtn.classList.add(
            `minus-btn-${menu.id}`,
            'minus-btn',
            'flex',
            'items-center',
            'justify-center',
            'h-5',
            'w-5',
          );

          plusBtn.addEventListener('click', (event) => {
            zutatAnfügen(index, menu.id, event);
    
          })
          minusBtn.addEventListener('click', () => {
              zutatEntfernen(index, menu.id);
      
          })

          zutatenListenEintrag.appendChild(plusBtn);
          zutatenListenEintrag.appendChild(minusBtn);

          if (zutatenBearbeitenStatus) {
            if (zutatenBearbeitenId === menu.id) {
              plusBtn.classList.remove('hidden');
              minusBtn.classList.remove('hidden');
              console.log('test1')

              plusBtn.classList.add('inline-block');
              minusBtn.classList.add('inline-block');

            } else {
              plusBtn.classList.add('hidden');
              minusBtn.classList.add('hidden');
              plusBtn.classList.remove('inline-block');
              minusBtn.classList.remove('inline-block');
              console.log('test2')

            }

            if (zutatenBearbeitungsBtn.classList.contains(`zutaten-bearbeitungs-btn-${zutatenBearbeitenId}`)) {
              zutatenBearbeitungsBtn.innerHTML = `<svg class="hover:fill-green-600" data-bearbeitungsid="${menu.id}"  xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#4ADE80"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>`
            } else if (mengeInput.style.display === 'block'){
              zutatenBearbeitungsBtn.innerHTML = `<svg class="hover:fill-green-600" data-bearbeitungsid="${menu.id}" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"  fill="#4ADE80"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`;
            } else {
              zutatenBearbeitungsBtn.innerHTML = `<svg class="hover:fill-green-600" data-bearbeitungsid="${menu.id}" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"  fill="#4ADE80"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`;
            }

          } else if(!zutatenBearbeitenStatus) {
            console.log('test3')

            plusBtn.classList.remove('inline-block');
            minusBtn.classList.remove('inline-block');           
            plusBtn.classList.add('hidden');
            minusBtn.classList.add('hidden');

            zutatenBearbeitungsBtn.innerHTML = `<svg class="hover:fill-green-600" data-bearbeitungsid="${menu.id}" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"  fill="#4ADE80"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`;
          }



          if(plusBtn.classList.contains(`plus-btn-${zutatenBearbeitenId}`) && minusBtn.classList.contains(`minus-btn-${zutatenBearbeitenId}`)) {
            plusBtn.classList.remove('hidden');
            minusBtn.classList.remove('hidden');
            
            plusBtn.classList.add('inline-block');
            minusBtn.classList.add('inline-block');
          } else {
            plusBtn.classList.add('hidden')
            minusBtn.classList.add('hidden')
            zutatenListeContainer.classList.add('flex');

          }   
        });
        weitereZutatenBtn.classList.remove('hidden')
        weitereZutatenBtn.classList.add('block');
    





      } else if (menu.zutaten.length <= 0) {

        zutatenListeContainer.classList.add('flex');
        zutatenInput.classList.add('block');
        mengeInput.classList.add('block');
        zutatenBearbeitungsBtn.classList.add('hidden');
      }
    });


    const menuInputs = document.querySelectorAll('.menu-name-container input');
    const zutatenInputs = document.querySelectorAll('.menu-zutaten-container .input-container input');
    const mengeInputs = document.querySelectorAll('.menu-zutaten-container .input-container input:nth-child(2)');
    const weitereZutatenBtns = document.querySelectorAll('.weitere-zutaten');
    const bearbeitungsBtns = document.querySelectorAll('.menu-bearbeitungs-btn');

    menuInputs.forEach(input => {
      input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          addMenuToMenus(event);
        } 
      });
    });

    zutatenInputs.forEach(input => {
      input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          addZutatenToMenus(event);
        }
      });
    });

    mengeInputs.forEach(input => {
      input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          addMengeToMenus(event);
        }
      });
    });

    weitereZutatenBtns.forEach(button => {
      button.addEventListener('click', function(event) {
        addWeitereZutaten(event);
      });
    });

    bearbeitungsBtns.forEach(button => {
      button.addEventListener('click', function(event) {
        menuBearbeiten(event);
      });
    })
  }
  renderMenusFromStock();
}
  
