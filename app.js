
const defaultTagData = (id, text, x, y) => ({
    id: id,
    text: text,
    x: x,
    y: y,
    w: 150,
    h: 40,
    fontFamily: "'Open Sans', sans-serif", 
    fontSize: 18, 
    fontColor: '#ffffff',
    bold: false,
    italic: false,
    underline: false,
});

let nextTagId = 1;


const state = {
    'slide-0': [defaultTagData(nextTagId++, 'Text..', 200, 240)],
    'slide-1': [defaultTagData(nextTagId++, 'Text..', 200, 240)],
    'slide-2': [defaultTagData(nextTagId++, 'Text..', 200, 240)],
};

let selectedTag = null;
let currentSlideId = 'slide-0';



const controlsPanel = document.getElementById('controls-panel');
const styleControls = document.getElementById('style-controls');
const addTagBtn = document.getElementById('add-tag-btn');
const deleteTagBtn = document.getElementById('delete-tag-btn');

const fontFamilySelect = document.getElementById('font-family-select');
const fontSizeInput = document.getElementById('font-size-select');
const fontColorInput = document.getElementById('font-color-select');
const styleToggleBtns = document.querySelectorAll('.style-toggle');





function initSwiper() {
    const swiper = new Swiper('.mySwiper', {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        allowTouchMove: false, 
        initialSlide: 0, 
        on: {
            init: function() {
                updateActiveSlide(this.slides[this.activeIndex].querySelector('.image-stage').dataset.slideId);
                loadSlideImages();
            },
            slideChange: function() {
                const newSlideId = this.slides[this.activeIndex].querySelector('.image-stage').dataset.slideId;
                updateActiveSlide(newSlideId);
            }
        }
    });
}


function loadSlideImages() {
    const slideStages = document.querySelectorAll('.image-stage');
    slideStages.forEach((stage, index) => {

        if (!stage.style.backgroundImage || stage.style.backgroundImage.startsWith('url("data:')) {
            const imgPath = `assets/${index + 1}.jpg`;
            stage.style.backgroundImage = `url('${imgPath}')`;
        }
    });
}



function updateActiveSlide(newSlideId) {
    deselectTag(); 
    currentSlideId = newSlideId;


    document.querySelectorAll('.tag').forEach(tag => tag.remove());


    const stage = document.querySelector(`[data-slide-id="${currentSlideId}"]`);
    state[currentSlideId].forEach(tagData => {
        const tagEl = renderTag(tagData, stage);
        tagEl.style.display = 'block';
    });
}

/**

 * @param {object} tagData - The tag object from the state.
 * @param {HTMLElement} stage - The current image-stage container.
 * @returns {HTMLElement} The updated or newly created tag DOM element.
 */
function renderTag(tagData, stage) {
    let tagEl = stage.querySelector(`.tag[data-tag-id="${tagData.id}"]`);

    if (!tagEl) {

        tagEl = document.createElement('div');
        tagEl.classList.add('tag');
        tagEl.setAttribute('data-tag-id', tagData.id);
        
        const contentEl = document.createElement('div');
        contentEl.classList.add('tag-content');
        contentEl.setAttribute('contenteditable', 'true');
        contentEl.textContent = tagData.text;

        const handleEl = document.createElement('div');
        handleEl.classList.add('resize-handle');
        handleEl.setAttribute('data-action', 'resize');

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('tag-delete-btn');
        deleteBtn.setAttribute('data-action', 'delete');
        deleteBtn.setAttribute('title', 'Delete Tag');
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>'; // Font Awesome X icon
        
        tagEl.appendChild(contentEl);
        tagEl.appendChild(handleEl);
        tagEl.appendChild(deleteBtn);
        stage.appendChild(tagEl);

        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (tagEl === selectedTag) {
                deleteSelectedTag();
            } else {
                 selectTag(tagEl);
                 deleteSelectedTag();
            }
        });
    }
    
    
    const contentEl = tagEl.querySelector('.tag-content');
    
    tagEl.style.transform = `translate(${tagData.x}px, ${tagData.y}px)`;
    tagEl.style.width = `${tagData.w}px`;
    tagEl.style.height = `${tagData.h}px`;
    
    
    contentEl.textContent = tagData.text; 
    contentEl.style.fontFamily = tagData.fontFamily;
    contentEl.style.fontSize = `${tagData.fontSize}px`;
    contentEl.style.color = tagData.fontColor;
    contentEl.style.fontWeight = tagData.bold ? 'bold' : 'normal';
    contentEl.style.fontStyle = tagData.italic ? 'italic' : 'normal';
    contentEl.style.textDecoration = tagData.underline ? 'underline' : 'none';

    return tagEl;
}

/**
 */
function addNewTag() {
    const stage = document.querySelector(`[data-slide-id="${currentSlideId}"]`);
    if (!stage) return;

    const initialW = 150;
    const initialH = 40;
    const stageRect = stage.getBoundingClientRect();
    
    
    const centerX = (stageRect.width / 2) - (initialW / 2);
    const centerY = (stageRect.height / 2) - (initialH / 2);

    const newTagData = defaultTagData(nextTagId++, 'New Tag', centerX, centerY);
    newTagData.fontSize = 20; 

    state[currentSlideId].push(newTagData);
    const newTagEl = renderTag(newTagData, stage);
    
    
    selectTag(newTagEl);
    newTagEl.querySelector('.tag-content').focus();
}

/**
 
 * @param {HTMLElement} tagEl - The tag element to select.
 */
function selectTag(tagEl) {
    if (selectedTag === tagEl) return;

    deselectTag();

    selectedTag = tagEl;
    selectedTag.classList.add('selected');

    loadControlsFromTag(selectedTag);
    styleControls.classList.remove('disabled-controls');
}

/**
 
 */
function deselectTag() {
    if (selectedTag) {
        selectedTag.classList.remove('selected');
        updateTagStateFromElement(selectedTag); 
        selectedTag = null;
        styleControls.classList.add('disabled-controls');
    }
}

/**
 
 */
function deleteSelectedTag() {
    if (!selectedTag) return;

    const tagId = parseInt(selectedTag.dataset.tagId);
    
    
    state[currentSlideId] = state[currentSlideId].filter(tag => tag.id !== tagId);
    
    
    selectedTag.remove();
    
    
    deselectTag();
}

/**
 
 * @param {HTMLElement} tagEl - The selected tag DOM element.
 */
function loadControlsFromTag(tagEl) {
    const tagData = state[currentSlideId].find(tag => tag.id === parseInt(tagEl.dataset.tagId));
    if (!tagData) return;

    fontFamilySelect.value = tagData.fontFamily;
    fontSizeInput.value = tagData.fontSize.toString();
    fontColorInput.value = tagData.fontColor;

    document.getElementById('toggle-bold').setAttribute('aria-pressed', tagData.bold);
    document.getElementById('toggle-italic').setAttribute('aria-pressed', tagData.italic);
    document.getElementById('toggle-underline').setAttribute('aria-pressed', tagData.underline);
}


/**
 
 */
function updateTagStyle(property, value) {
    if (!selectedTag) return;
    
    const tagData = state[currentSlideId].find(tag => tag.id === parseInt(selectedTag.dataset.tagId));
    if (!tagData) return;

    const contentEl = selectedTag.querySelector('.tag-content');
    
    switch (property) {
        case 'fontFamily':
            contentEl.style.fontFamily = value;
            break;
        case 'fontSize':
            contentEl.style.fontSize = `${value}px`;
            break;
        case 'fontColor':
            contentEl.style.color = value;
            break;
        case 'bold':
            contentEl.style.fontWeight = value ? 'bold' : 'normal';
            document.getElementById('toggle-bold').setAttribute('aria-pressed', value);
            break;
        case 'italic':
            contentEl.style.fontStyle = value ? 'italic' : 'normal';
            document.getElementById('toggle-italic').setAttribute('aria-pressed', value);
            break;
        case 'underline':
            contentEl.style.textDecoration = value ? 'underline' : 'none';
            document.getElementById('toggle-underline').setAttribute('aria-pressed', value);
            break;
    }

    tagData[property] = value;
}

/**
 
 */
function updateTagStateFromElement(tagEl) {
    const tagData = state[currentSlideId].find(tag => tag.id === parseInt(tagEl.dataset.tagId));
    if (tagData) {
        tagData.text = tagEl.querySelector('.tag-content').textContent;
    }
}



/**
 */

let isDragging = false;
let isResizing = false;
let activePointerId = null;
let initialX, initialY, initialW, initialH;
let tagOffset = { x: 0, y: 0 };
let stageBounds = null;
let currentAction = null; 

/**
 * @param {PointerEvent} e 
 */
function handlePointerDown(e) {
    if (activePointerId !== null) return; 

    
    if (e.target.closest('.tag-delete-btn')) {
        return;
    }
    
    const targetTag = e.target.closest('.tag');

    
    if (!targetTag && !e.target.closest('#controls-panel')) {
        deselectTag();
        return;
    }

    if (targetTag) {
        selectTag(targetTag);
    }
    
    
    if (e.target.closest('.resize-handle')) {
        currentAction = 'resize';
    } else if (targetTag) {
                
        if (e.target.closest('.tag-content') && window.getSelection().toString().length === 0) {
            
             return; 
        }
        currentAction = 'drag';
    } else {
        return;
    }

    
    const tagEl = selectedTag;
    if (!tagEl) return;

    activePointerId = e.pointerId;
    e.preventDefault(); 
    tagEl.setPointerCapture(activePointerId); 

    const currentTransform = tagEl.style.transform.match(/translate\((.*?)px,\s*(.*?)px\)/);
    const currentX = currentTransform ? parseFloat(currentTransform[1]) : 0;
    const currentY = currentTransform ? parseFloat(currentTransform[2]) : 0;
    
    initialX = e.clientX;
    initialY = e.clientY;
    initialW = tagEl.offsetWidth;
    initialH = tagEl.offsetHeight;
    tagOffset = { x: currentX, y: currentY };
    
    const stage = tagEl.closest('.image-stage');
    if (stage) {
        stageBounds = stage.getBoundingClientRect();
    }
    
    isDragging = (currentAction === 'drag');
    isResizing = (currentAction === 'resize');
}


function handlePointerMove(e) {
    if (e.pointerId !== activePointerId || (!isDragging && !isResizing) || !selectedTag || !stageBounds) return;

    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;
    const tagData = state[currentSlideId].find(tag => tag.id === parseInt(selectedTag.dataset.tagId));
    if (!tagData) return;

    const minSize = 30; 

    if (isDragging) {
        let newX = tagOffset.x + dx;
        let newY = tagOffset.y + dy;
        
        
        newX = Math.max(0, Math.min(newX, stageBounds.width - selectedTag.offsetWidth));
        
        
        newY = Math.max(0, Math.min(newY, stageBounds.height - selectedTag.offsetHeight));

        selectedTag.style.transform = `translate(${newX}px, ${newY}px)`;
        tagData.x = newX;
        tagData.y = newY;

    } else if (isResizing) {
        let newW = initialW + dx;
        let newH = initialH + dy;
        
        
        newW = Math.max(minSize, newW);
        newH = Math.max(minSize, newH);

        const currentTransform = selectedTag.style.transform.match(/translate\((.*?)px,\s*(.*?)px\)/);
        const currentX = currentTransform ? parseFloat(currentTransform[1]) : 0;
        const currentY = currentTransform ? parseFloat(currentTransform[2]) : 0;

        
        const maxX = stageBounds.width - currentX;
        newW = Math.min(newW, maxX);
        
        const maxY = stageBounds.height - currentY;
        newH = Math.min(newH, maxY);

        selectedTag.style.width = `${newW}px`;
        selectedTag.style.height = `${newH}px`;

        tagData.w = newW;
        tagData.h = newH;
    }
}

/**
 
 * @param {PointerEvent} e 
 */
function handlePointerUp(e) {
    if (e.pointerId !== activePointerId) return;

    if (selectedTag) {
        selectedTag.releasePointerCapture(activePointerId);
        updateTagStateFromElement(selectedTag); 
    }

    isDragging = false;
    isResizing = false;
    activePointerId = null;
    currentAction = null;
    stageBounds = null;
}

    

document.addEventListener('pointerdown', handlePointerDown);
document.addEventListener('pointermove', handlePointerMove);
document.addEventListener('pointerup', handlePointerUp);
document.addEventListener('pointercancel', handlePointerUp); 

document.addEventListener('click', (e) => {
    
    if (!e.target.closest('.tag') && !e.target.closest('#controls-panel') && !e.target.closest('.swiper-button-next') && !e.target.closest('.swiper-button-prev')) {
        deselectTag();
    }
});

    
addTagBtn.addEventListener('click', addNewTag);
deleteTagBtn.addEventListener('click', deleteSelectedTag); 

fontFamilySelect.addEventListener('change', (e) => updateTagStyle('fontFamily', e.target.value));
fontSizeInput.addEventListener('change', (e) => updateTagStyle('fontSize', parseInt(e.target.value)));
fontColorInput.addEventListener('change', (e) => updateTagStyle('fontColor', e.target.value));
    
styleToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (!selectedTag) return;
        const style = btn.dataset.style; 
        const tagData = state[currentSlideId].find(tag => tag.id === parseInt(selectedTag.dataset.tagId));
        
        const newValue = !tagData[style]; 
        
        updateTagStyle(style, newValue);
    });
});

    
document.addEventListener('DOMContentLoaded', initSwiper);