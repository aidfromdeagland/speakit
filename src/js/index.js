import 'regenerator-runtime/runtime';
import shuffle from './util';


const sourcePrefix = 'https://raw.githubusercontent.com/aidfromdeagland/rslang-data/master/data/';
const translating = {
  url: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
  key: 'trnsl.1.1.20200425T081929Z.3bba1eb75d5bc76d.5fea4fd6b0ecdf0f12fad4cbebb8d1a5e61c9c5b',
  lang: 'en-ru',
};
const questSrc = './src/img/question-mark.png';
const pageAudio = document.querySelector('.audio');
const intro = document.querySelector('.intro');
const introButton = intro.querySelector('.intro__button');
const header = document.querySelector('header');
const rangeLevel = header.querySelector('.header__range_level');
const textLevel = header.querySelector('.header__text_level');
const rangePack = header.querySelector('.header__range_pack');
const textPack = header.querySelector('.header__text_pack');
let level = +rangeLevel.value - 1;
let pack = +rangePack.value - 1;
const main = document.querySelector('.main');
const content = main.querySelector('.content');
const points = content.querySelector('.content__points');
const buttonSpeak = content.querySelector('.content__button_speak');
const cardsContainer = content.querySelector('.cards-container');
const cards = cardsContainer.querySelectorAll('.card');
const scene = cardsContainer.querySelector('.scene');
const sceneImage = scene.querySelector('.scene__image');
const sceneTranslation = scene.querySelector('.scene__translation');
const wordsOnPage = [];
const resolvedWords = [];
let isGameMode = false;

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
window.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();
recognition.grammars = speechRecognitionList;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.continuous = false;
recognition.maxAlternatives = 3;

const resetContent = () => {
  wordsOnPage.length = 0;
  resolvedWords.length = 0;
  Array.from(cards).forEach((elem) => {
    wordsOnPage.push(elem.firstElementChild.innerText.toLowerCase());
  });
  sceneImage.src = questSrc;
  sceneImage.alt = '';
  sceneTranslation.innerText = '';

  const prevActiveCard = cardsContainer.querySelector('.card_active');
  if (prevActiveCard) {
    prevActiveCard.classList.remove('card_active');
  }

  Array.from(cards).forEach((element) => {
    element.classList.remove('card_match');
  });
  points.innerText = '';
};


const drawCards = async (group, page) => {
  const url = `https://afternoon-falls-25894.herokuapp.com/words?page=${page}&group=${group}`;
  const res = await fetch(url);
  const json = await res.json();
  const shuffledJson = shuffle(json);
  shuffledJson.length = 10;
  shuffledJson.forEach((element, index) => {
    cards[index].firstElementChild.innerText = element.word.toLowerCase();
    cards[index].lastElementChild.innerText = element.transcription;
    cards[index].dataset.imgsrc = element.image.slice(6);
    cards[index].dataset.audiosrc = element.audio.slice(6);
  });

  resetContent();
};

drawCards(level, pack);

introButton.addEventListener('click', () => {
  intro.classList.add('intro_faded');
  setTimeout(() => {
    intro.classList.add('intro_inactive');
  }, 750);
});

rangeLevel.addEventListener('input', () => {
  textLevel.innerText = rangeLevel.value;
});
rangePack.addEventListener('input', () => {
  textPack.innerText = rangePack.value;
});

header.addEventListener('change', () => {
  level = +rangeLevel.value - 1;
  pack = +rangePack.value - 1;
  drawCards(level, pack);
});

cardsContainer.addEventListener('click', (evt) => {
  if (evt.target.closest('.card') && isGameMode === false) {
    const selectedCard = evt.target.closest('.card');
    const prevActiveCard = cardsContainer.querySelector('.card_active');
    if (prevActiveCard) {
      prevActiveCard.classList.remove('card_active');
    }
    selectedCard.classList.add('card_active');

    const textTotTranslate = selectedCard.firstElementChild.textContent;
    fetch(`${translating.url}?key=${translating.key}&text=${textTotTranslate}&lang=${translating.lang}&`)
      .then((response) => response.json()).then((data) => {
      sceneTranslation.innerText = data.text[0];
      });
    sceneImage.src = sourcePrefix + selectedCard.dataset.imgsrc;
    sceneImage.alt = selectedCard.firstElementChild.textContent;
    pageAudio.src = sourcePrefix + selectedCard.dataset.audiosrc;
    pageAudio.play();
  }
});

buttonSpeak.addEventListener('click', () => {
  resetContent();
  if (!buttonSpeak.classList.contains('content__button_speak_active')) {
    buttonSpeak.classList.add('content__button_speak_active');
    buttonSpeak.innerText = 'on air!';
    isGameMode = true;
    rangeLevel.disabled = true;
    rangePack.disabled = true;
    sceneTranslation.classList.add('scene__translation_game');

    recognition.addEventListener('end', recognition.start);
    recognition.start();
  } else {
    buttonSpeak.classList.remove('content__button_speak_active');
    buttonSpeak.innerText = 'speak';
    isGameMode = false;
    rangeLevel.disabled = false;
    rangePack.disabled = false;
    sceneTranslation.classList.remove('scene__translation_game');

    recognition.removeEventListener('end', recognition.start);
    recognition.abort();
  }
});


recognition.addEventListener('result', (evt) => {
  let isFit = false;
  for (let i = 0; i < evt.results[0].length; i += 1) {
    if (wordsOnPage.indexOf(evt.results[0][i].transcript.toLowerCase()) !== -1
      && !resolvedWords.some((word) => word === evt.results[0][i].transcript)) {
      isFit = true;
      resolvedWords.push(evt.results[0][i].transcript.toLowerCase());
      const matchIndex = wordsOnPage.indexOf(evt.results[0][i].transcript.toLowerCase());
      const matchedCard = cards[matchIndex];
      matchedCard.classList.add('card_match');
      recognition.stop();
      sceneTranslation.innerText = matchedCard.firstElementChild.textContent;
      sceneImage.src = sourcePrefix + matchedCard.dataset.imgsrc;
      sceneImage.alt = matchedCard.firstElementChild.textContent;
      points.innerText += '⭐';
      if (wordsOnPage.length === resolvedWords.length) {
        alert('Congratulations!');
        drawCards(0, 0);
      }
      break;
    }
  }

  if (isFit === false) {
    sceneTranslation.innerText = evt.results[0][0].transcript;
    sceneImage.src = questSrc;
    sceneImage.alt = 'speak';
  }
});
