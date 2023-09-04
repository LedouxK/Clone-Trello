// Définition des variables globales pour stocker les éléments HTML
let actualContainer: HTMLDivElement,
    actualBtn: HTMLButtonElement,
    actualUL: HTMLUListElement,
    actualForm: HTMLFormElement,
    actualTextInput: HTMLInputElement,
    actualValidation: HTMLSpanElement;

// Sélection de tous les conteneurs d'éléments avec la classe 'items-container'
const itemsContainer = document.querySelectorAll('.items-container') as NodeListOf<HTMLDivElement>;

// Fonction pour ajouter des écouteurs d'événements aux conteneurs
function addContainerListeners(currentContainer: HTMLDivElement) {
    // Sélection des éléments HTML à l'intérieur du conteneur actuel
    const currentContainerDeletionBtn = currentContainer.querySelector('.delete-container-btn') as HTMLButtonElement;
    const currentAddItemBtn = currentContainer.querySelector('.add-item-btn') as HTMLButtonElement;
    const currentCloseFormBtn = currentContainer.querySelector('.close-form-btn') as HTMLButtonElement;
    const currentForm = currentContainer.querySelector('form') as HTMLFormElement;

    // Appel de différentes fonctions pour ajouter des écouteurs d'événements spécifiques
    deleteBtnListeners(currentContainerDeletionBtn);
    addItemBtnListeners(currentAddItemBtn);
    closingFormBtnListeners(currentCloseFormBtn);
    addFormSubmitListeners(currentForm);
    addDDListeners(currentContainer);
}

// Itération à travers chaque conteneur et ajout d'écouteurs d'événements
itemsContainer.forEach((container: HTMLDivElement) => {
    addContainerListeners(container);
});

// Fonction pour ajouter un écouteur d'événement au bouton de suppression du conteneur
function deleteBtnListeners(btn: HTMLButtonElement) {
    btn.addEventListener('click', handleContainerDeletion);
}

// Fonction pour ajouter un écouteur d'événement au bouton d'ajout d'élément
function addItemBtnListeners(btn: HTMLButtonElement) {
    btn.addEventListener('click', handleAddItem);
}

// Fonction pour ajouter un écouteur d'événement au bouton de fermeture du formulaire
function closingFormBtnListeners(btn: HTMLButtonElement) {
    btn.addEventListener('click', () => toggleForm(actualBtn, actualForm, false));
}

// Fonction pour ajouter un écouteur d'événement à la soumission du formulaire
function addFormSubmitListeners(form: HTMLFormElement) {
    form.addEventListener('submit', createNewItem);
}

// Fonction pour ajouter des écouteurs d'événements de Drag and drop
function addDDListeners(element: HTMLElement) {
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('dragend', handleDragEnd);
}

// Fonction pour gérer la suppression d'un conteneur
function handleContainerDeletion(e: MouseEvent) {
    const btn = e.target as HTMLButtonElement;
    const btnsArray = [...document.querySelectorAll('.delete-container-btn')] as HTMLButtonElement[];
    const containers = [...document.querySelectorAll('.items-container')] as HTMLDivElement[];
    // Supprime le conteneur correspondant au bouton supprimé
    containers[btnsArray.indexOf(btn)].remove();
}

// Fonction pour gérer l'ajout d'un nouvel élément
function handleAddItem(e: MouseEvent) {
    const btn = e.target as HTMLButtonElement;
    // Si un conteneur est déjà ouvert, ferme-le
    if (actualContainer) toggleForm(actualBtn, actualForm, false);
    // Configure le conteneur actuel pour le nouvel élément
    setContainerItems(btn);
    // Affiche le formulaire pour ajouter un nouvel élément
    toggleForm(actualBtn, actualForm, true);
}

// Fonction pour basculer l'affichage du formulaire
function toggleForm(btn: HTMLButtonElement, form: HTMLFormElement, action: boolean) {
    if (!action) {
        form.style.display = "none";
        btn.style.display = "block";
    } else if (action) {
        form.style.display = "block";
        btn.style.display = "none";
    }
}

// Fonction pour configurer les éléments du conteneur actuel
function setContainerItems(btn: HTMLButtonElement) {
    actualBtn = btn;
    actualContainer = btn.parentElement as HTMLDivElement;
    actualUL = actualContainer.querySelector('ul') as HTMLUListElement;
    actualForm = actualContainer.querySelector('form') as HTMLFormElement;
    actualTextInput = actualContainer.querySelector('input') as HTMLInputElement;
    actualValidation = actualContainer.querySelector('.validation-msg') as HTMLSpanElement;
}

// Fonction pour créer un nouvel élément
function createNewItem(e: Event) {
    e.preventDefault();
    if (actualTextInput.value.length === 0) {
        actualValidation.textContent = " Must be at least 1 character long";
        return;
    } else {
        actualValidation.textContent = "";
    }
    // Création de l'élément
    const itemContent = actualTextInput.value;
    const li = `<li class="item" draggable="true">
    <p>${itemContent}</p>
    <button>X</button>
    </li>`;
    actualUL.insertAdjacentHTML('beforeend', li);
    const item = actualUL.lastElementChild as HTMLLIElement;
    const liBtn = item.querySelector('button') as HTMLButtonElement;
    handleItemDeletion(liBtn);
    addDDListeners(item);
    actualTextInput.value = "";
}

// Fonction pour gérer la suppression d'un élément
function handleItemDeletion(btn: HTMLButtonElement) {
    btn.addEventListener('click', () => {
        const elToRemove = btn.parentElement as HTMLLIElement;
        elToRemove.remove();
    });
}

// Gestion du Drag and Drop
let dragSrcEl: HTMLElement;

// Fonction pour gérer le début du Drag and Drop
function handleDragStart(this: HTMLElement, e: DragEvent) {
    e.stopPropagation();
    if (actualContainer) toggleForm(actualBtn, actualForm, false);
    dragSrcEl = this;
    e.dataTransfer?.setData('text/html', this.innerHTML);
}

// Fonction pour gérer le survol lors du Drag and Drop
function handleDragOver(e: DragEvent) {
    e.preventDefault();
}

// Fonction pour gérer le largage lors du Drag and Drop
function handleDrop(this: HTMLElement, e: DragEvent) {
    // Empêche la propagation de l'événement pour éviter les conflits de Drag and Drop
    e.stopPropagation();
    
    // L'élément de réception est l'élément sur lequel l'élément glissé est largué
    const receptionEl = this;

    // Si l'élément glissé est un <li> (élément de liste) et que l'élément de réception est un conteneur d'items
    if (dragSrcEl.nodeName === "LI" && receptionEl.classList.contains("items-container")) {
        // Ajoute l'élément glissé à la liste de l'élément de réception
        (receptionEl.querySelector('ul') as HTMLUListElement).appendChild(dragSrcEl);

        // Ajoute des écouteurs d'événements de glisser-déposer à l'élément glissé
        addDDListeners(dragSrcEl);

        // Ajoute un écouteur d'événement pour la suppression de l'élément glissé
        handleItemDeletion(dragSrcEl.querySelector("button") as HTMLButtonElement);
    }

    // Si l'élément glissé est différent de l'élément de réception et qu'ils ont la même classe
    if (dragSrcEl !== this && this.classList[0] === dragSrcEl.classList[0]) {
        // Échange le contenu HTML entre l'élément glissé et l'élément de réception
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer?.getData('text/html') as string;

        // Si l'élément de réception est un conteneur d'items
        if (this.classList.contains("items-container")) {
            // Ajoute des écouteurs d'événements aux éléments de la liste de l'élément de réception
            this.querySelectorAll('li').forEach((li: HTMLLIElement) => {
                // Ajoute un écouteur d'événement pour la suppression de chaque élément de la liste
                handleItemDeletion(li.querySelector('button') as HTMLButtonElement);
                // Ajoute des écouteurs d'événements de glisser-déposer à chaque élément de la liste
                addDDListeners(li);
            });
        } else {
            // Si l'élément de réception n'est pas un conteneur d'items, ajoute simplement des écouteurs d'événements de glisser-déposer
            addDDListeners(this);
            // Ajoute un écouteur d'événement pour la suppression de l'élément de réception
            handleItemDeletion(this.querySelector("button") as HTMLButtonElement);
        }
    }
}


// Fonction pour gérer la fin du Drag and Drop
function handleDragEnd(this: HTMLElement, e: DragEvent) {
    // Empêche la propagation de l'événement pour éviter les conflits de Drag and Drop
    e.stopPropagation();
    
    // Vérifie si l'élément actuel est un conteneur d'items
    if (this.classList.contains('items-container')) {
        // Si c'est le cas, ajoute des écouteurs d'événements aux éléments du conteneur
        addContainerListeners(this as HTMLDivElement);

        // Vérifie s'il y a des éléments <li> dans le conteneur
        if (this.querySelectorAll("li")) {
            // Parcourt chaque élément <li> dans le conteneur
            this.querySelectorAll('li').forEach((li: HTMLLIElement) => {
                // Ajoute un écouteur d'événement pour la suppression de chaque élément <li>
                handleItemDeletion(li.querySelector('button') as HTMLButtonElement);
                // Ajoute des écouteurs d'événements de glisser-déposer à chaque élément <li>
                addDDListeners(li);
            });
        }
    } else {
        // Si l'élément actuel n'est pas un conteneur d'items, ajoute simplement des écouteurs d'événements de glisser-déposer
        addDDListeners(this);
    }
}

// Ajout d'un nouveau conteneur //
const addContainerBtn = document.querySelector('.add-container-btn') as HTMLButtonElement;
const addContainerForm = document.querySelector('.add-new-container form') as HTMLFormElement;
const addContainerFormInput = document.querySelector('.add-new-container input') as HTMLInputElement;
const validationNewContainer = document.querySelector('.add-new-container .validation-msg') as HTMLSpanElement;
const addContainerCloseBtn = document.querySelector('.close-add-list') as HTMLButtonElement;
const addNewContainer = document.querySelector('.add-new-container') as HTMLDivElement;
const containersList = document.querySelector('.main-content') as HTMLDivElement;

// Écouteur d'événement pour afficher le formulaire de création d'un nouveau conteneur
addContainerBtn.addEventListener('click', () => {
    toggleForm(addContainerBtn, addContainerForm, true);
});

// Écouteur d'événement pour fermer le formulaire de création d'un nouveau conteneur
addContainerCloseBtn.addEventListener('click', () => {
    toggleForm(addContainerBtn, addContainerForm, false);
});

// Écouteur d'événement pour soumettre le formulaire de création d'un nouveau conteneur
addContainerForm.addEventListener('submit', createNewContainer);

// Fonction pour créer un nouveau conteneur
function createNewContainer(e: Event) {
    // Empêche le comportement par défaut du formulaire (rechargement de la page)
    e.preventDefault();

    // Vérifie si le champ de saisie du nom du conteneur est vide
    if (addContainerFormInput.value.length === 0) {
        // Affiche un message de validation si le champ est vide
        validationNewContainer.textContent = "Must be at least 1 character long";
        return; // Arrête l'exécution de la fonction
    } else {
        // Efface le message de validation s'il y en avait un précédemment
        validationNewContainer.textContent = "";
    }

    // Sélectionne le modèle du conteneur existant (un conteneur d'items vide)
    const itemsContainer = document.querySelector(".items-container") as HTMLDivElement;

    // Clone le modèle du conteneur pour créer un nouveau conteneur
    const newContainer = itemsContainer.cloneNode() as HTMLDivElement;

    // Crée le contenu HTML du nouveau conteneur en utilisant le nom saisi dans le formulaire
    const newContainerContent = `
    <div class="top-container">
      <h2>${addContainerFormInput.value}</h2>
      <button class="delete-container-btn">X</button>
    </div>
    <ul></ul>
    <button class="add-item-btn">Add an item</button>
    <form autocomplete="off">
      <div class="top-form-container">
        <label for="item">Add a new item</label>
        <button type="button" class="close-form-btn">X</button>
      </div>
      <input type="text" id="item" />
      <span class="validation-msg"></span>
      <button type="submit">Submit</button>
    </form>`;

    // Remplace le contenu HTML du nouveau conteneur par le contenu créé ci-dessus
    newContainer.innerHTML = newContainerContent;

    // Insère le nouveau conteneur juste avant le formulaire d'ajout existant
    containersList.insertBefore(newContainer, addNewContainer);

    // Réinitialise le champ de saisie du nom du conteneur
    addContainerFormInput.value = "";

    // Ajoute des écouteurs d'événements aux éléments du nouveau conteneur
    addContainerListeners(newContainer);
}
