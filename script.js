let currentFilter = null; // Track the current category filter

// Fetch the dictionary data from the JSON file
fetch('dictionary.json')
    .then(response => response.json())
    .then(data => {
        initializeAvailableWords(data); // Initialize available words section
        generateAlphabetButtons(); // Generate alphabet buttons
    })
    .catch(error => console.error('Error loading dictionary:', error));

// Function to initialize available words based on dictionary data
function initializeAvailableWords(words) {
    const categoriesContainer = document.getElementById('categories-container');
    const categories = {};

    // Group words by category
    words.forEach(word => {
        if (!categories[word.category]) {
            categories[word.category] = [];
        }
        categories[word.category].push(word);
    });

    // Create a section for each category
    for (const [category, words] of Object.entries(categories)) {
        const categorySection = document.createElement('div');
        categorySection.classList.add('category-list');
        categorySection.dataset.category = category;

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.textContent = category;

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        words.forEach(word => {
            const cardElement = createCard(word);
            categoryContainer.appendChild(cardElement);
        });

        categorySection.appendChild(categoryTitle);
        categorySection.appendChild(categoryContainer);
        categoriesContainer.appendChild(categorySection);
    }

    // Initialize cards with category data attribute
    initializeCards(words);
}

// Function to create a card element
function createCard(card) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.innerHTML = `
        <div class="front">${card.chinese}</div>
        <div class="back">
            <div>Pinyin<br> <strong>${card.pinyin}</strong></div>
            <div>Meaning<br> <strong>${card.meaning}</strong></div>
        </div>  
    `;

    // Adding click event to flip the card
    cardElement.addEventListener('click', function() {
        cardElement.classList.toggle('flipped');
    });

    // Adding drag and drop functionality
    cardElement.draggable = true;
    cardElement.addEventListener('dragstart', function(event) {
        // Set data for the drag
        event.dataTransfer.setData('application/json', JSON.stringify(card));
        event.dataTransfer.effectAllowed = 'move';
        // Optional: Add a class to indicate dragging
        cardElement.classList.add('dragging');
    });

    // Optional: Remove the dragging class when drag ends
    cardElement.addEventListener('dragend', function() {
        cardElement.classList.remove('dragging');
    });

    // Set the category data attribute for filtering
    cardElement.dataset.category = card.category; // Use category for filtering

    return cardElement;
}

// Function to generate alphabet buttons from A to Z and a clear button
function generateAlphabetButtons() {
    const alphabetIndex = document.getElementById('category-index');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#±'.split('');

    // Clear existing buttons
    alphabetIndex.innerHTML = '';

    // Create buttons for each letter in the alphabet
    alphabet.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.onclick = () => filterByCategory(letter);
        alphabetIndex.appendChild(button);
    });

    // Add a clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.onclick = clearFilter;
    alphabetIndex.appendChild(clearButton);
}

// Function to filter cards based on category
function filterByCategory(category) {
    const categoriesContainer = document.getElementById('categories-container');
    const categorySections = categoriesContainer.getElementsByClassName('category-list');

    // If the same category is clicked again, clear the filter
    if (currentFilter === category) {
        clearFilter();
        return;
    }

    // Set the current filter
    currentFilter = category;

    for (let section of categorySections) {
        if (section.dataset.category === category) {
            section.style.display = 'block'; // Show the matching category section
        } else {
            section.style.display = 'none'; // Hide non-matching category sections
        }
    }
}

// Function to clear the category filter
function clearFilter() {
    const categoriesContainer = document.getElementById('categories-container');
    const categorySections = categoriesContainer.getElementsByClassName('category-list');

    for (let section of categorySections) {
        section.style.display = 'block'; // Show all category sections
    }

    currentFilter = null; // Reset the current filter
}

// Function to initialize the cards with category data-attribute
function initializeCards(words) {
    const categoriesContainer = document.getElementById('categories-container');
    const cards = categoriesContainer.getElementsByClassName('card');

    for (let card of cards) {
        // Use the already available category data for filtering
        const chineseChar = card.innerText.trim();
        const entry = words.find(entry => entry.chinese === chineseChar);
        if (entry) {
            card.dataset.category = entry.category; // Set the category data attribute
        }
    }
}

// Function to clear the sentence board
function clearSentenceBoard() {
    const sentenceDropzone = document.getElementById('sentence-dropzone');
    sentenceDropzone.innerHTML = ''; // Clear all child elements

    // Show instructions if no cards are left
    const sentenceInstructions = document.getElementById('sentence-instructions');
    sentenceInstructions.style.display = 'block';
}

// Adding drop event for sentence board
const sentenceDropzone = document.getElementById('sentence-dropzone');
const sentenceInstructions = document.getElementById('sentence-instructions');

// Prevent default drag behaviors to allow drops
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    sentenceDropzone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(event) {
    event.preventDefault();
    event.stopPropagation();
}

// Highlight drop zone when a draggable element enters
sentenceDropzone.addEventListener('dragenter', function() {
    sentenceDropzone.classList.add('highlight');
});

// Remove highlight from drop zone when a draggable element leaves
sentenceDropzone.addEventListener('dragleave', function() {
    sentenceDropzone.classList.remove('highlight');
});

// Handle the drop event to add a card to the sentence board
sentenceDropzone.addEventListener('drop', function(event) {
    const cardData = event.dataTransfer.getData('application/json');
    if (cardData) {
        const card = JSON.parse(cardData);

        // Remove sentence instructions once a card is dropped
        sentenceInstructions.style.display = 'none';

        // Create a new span element for the dropped card
        const droppedCard = document.createElement('span');
        droppedCard.textContent = card.chinese;
        droppedCard.classList.add('dropped-card');

        // Append the dropped card to the sentence dropzone
        sentenceDropzone.appendChild(droppedCard);

        // Add event listener to each dropped card for removal
        droppedCard.addEventListener('click', function() {
            sentenceDropzone.removeChild(droppedCard);

            // Show instructions if no cards are left
            if (sentenceDropzone.children.length === 0) {
                sentenceInstructions.style.display = 'block';
            }
        });

        // Allow reordering of cards in the sentence dropzone
        droppedCard.draggable = true;
        droppedCard.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text/plain', droppedCard.textContent);
            event.dataTransfer.effectAllowed = 'move';
        });

        // Handle dropping within the dropzone to reorder
        droppedCard.addEventListener('dragover', preventDefaults);
        droppedCard.addEventListener('drop', reorderCards);

        // Remove highlight from drop zone
        sentenceDropzone.classList.remove('highlight');
    }
});

// Function to reorder cards within the sentence dropzone
function reorderCards(event) {
    const chineseCharacter = event.dataTransfer.getData('text/plain');
    const target = event.target;
    if (target.classList.contains('dropped-card')) {
        const newCard = document.createElement('span');
        newCard.textContent = chineseCharacter;
        newCard.classList.add('dropped-card');
        target.insertAdjacentElement('beforebegin', newCard);
        target.parentElement.removeChild(event.target);

        // Add event listener for the newly inserted card
        newCard.addEventListener('click', function() {
            sentenceDropzone.removeChild(newCard);

            // Show instructions if no cards are left
            if (sentenceDropzone.children.length === 0) {
                sentenceInstructions.style.display = 'block';
            }
        });

        // Allow reordering of newly inserted card
        newCard.draggable = true;
        newCard.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text/plain', newCard.textContent);
            event.dataTransfer.effectAllowed = 'move';
        });

        // Handle dropping within the dropzone to reorder
        newCard.addEventListener('dragover', preventDefaults);
        newCard.addEventListener('drop', reorderCards);
    }
}

// Initialize Pinyin display as hidden
document.getElementById('pinyin-display').style.display = 'none';
