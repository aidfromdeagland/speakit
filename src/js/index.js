import 'regenerator-runtime/runtime';
import shuffle from './util';


const sourcePrefix = 'https://raw.githubusercontent.com/aidfromdeagland/rslang-data/master/data/';
const translating = {
  url: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
  key: 'trnsl.1.1.20200425T081929Z.3bba1eb75d5bc76d.5fea4fd6b0ecdf0f12fad4cbebb8d1a5e61c9c5b',
  lang: 'en-ru',
};
const pageAudio = document.querySelector('.audio');
const intro = document.querySelector('.intro');
const introButton = intro.querySelector('.intro__button');
const header = document.querySelector('header');
const rangeLevel = header.querySelector('.header__range_level');
const textLevel = header.querySelector('.header__text_level');
const rangePack = header.querySelector('.header__range_pack');
const textPack = header.querySelector('.header__text_pack');
const main = document.querySelector('.main');
const content = main.querySelector('.content');
const cardsContainer = content.querySelector('.cards-container');
const cards = cardsContainer.querySelectorAll('.card');
const scene = cardsContainer.querySelector('.scene');
const sceneImage = scene.querySelector('.scene__image');
const sceneTranslation = scene.querySelector('.scene__translation');

const drawCards = async (group, page) => {
  const url = `https://afternoon-falls-25894.herokuapp.com/words?page=${page}&group=${group}`;
  const res = await fetch(url);
  const json = await res.json();
  const shuffledJson = shuffle(json);
  shuffledJson.length = 10;
  shuffledJson.forEach((element, index) => {
    cards[index].firstElementChild.innerText = element.word;
    cards[index].lastElementChild.innerText = element.transcription;
    cards[index].dataset.imgsrc = element.image.slice(6);
    cards[index].dataset.audiosrc = element.audio.slice(6);
  });

  sceneImage.src = '';
  sceneImage.alt = '';
  sceneTranslation.innerText = '';
};

drawCards(0, 0);

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
  const level = +rangeLevel.value - 1;
  const pack = +rangePack.value - 1;
  drawCards(level, pack);
});

cardsContainer.addEventListener('click', (evt) => {
  if (evt.target.closest('.card')) {
    const selectedCard = evt.target.closest('.card');
    const textTotTranslate = selectedCard.firstElementChild.textContent;
    fetch(`${translating.url}?key=${translating.key}&text=${textTotTranslate}&lang=${translating.lang}&`)
      .then((response) => response.json()).then((data) => { sceneTranslation.innerText = data.text[0]; });
    sceneImage.src = sourcePrefix + selectedCard.dataset.imgsrc;
    sceneImage.alt = selectedCard.firstElementChild.textContent;
    pageAudio.src = sourcePrefix + selectedCard.dataset.audiosrc;
    pageAudio.play();
  }
});
