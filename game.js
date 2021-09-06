
var currentCardId = 0;
var cardCount = 0;
var score = 0;
var timer;

function LCG(s) {
    return function() {
        s = Math.imul(48271, s) | 0 % 2147483647;
        return (s & 2147483647) / 2147483648;
    }
}

function shuffle(array, seed) {
    let nSeed = 0;
    if(isNaN(seed)){
        for(let i = 0; i < seed.length; ++i) {
            nSeed += seed.charCodeAt(i);
        }
    } else {
        nSeed = parseInt(seed);
    }

    let rand = LCG(nSeed);

    let i = array.length;

    while (i > 0) {
        let j = Math.floor(rand() * i);
        --i;

        let tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }

    return array;
}

function buildDeck(seed){
    let shuffled = shuffle([... cards], seed);

    let deckHTML = "";
    for(let i = 0; i < shuffled.length; ++i){
        let card = shuffled[i];
        deckHTML += `<div id="card${i}" class="card back-card"><div class="card-content"><div class="card-word">${card['word']}</div>`;
        for(let j = 0; j < card['taboo'].length; ++j){
            deckHTML += `<div class="card-taboo">${card['taboo'][j]}</div>`;
        }
        deckHTML += '</div></div>';
    }
    document.getElementById("deck").innerHTML = deckHTML;

    currentCardId = 0;
    let currentCard = document.getElementById(`card${currentCardId}`);
    currentCard.classList.add('front-card');
    currentCard.classList.remove('back-card');

    cardCount = shuffled.length;
}

function updateTimer(timeleft){
    let min = String(Math.floor(timeleft / 60)).padStart(1, '0');
    let sec = String(timeleft % 60).padStart(2, '0');
    document.getElementById("timer-value").innerHTML = min + ":" + sec;
}

function setTimer(timelimit){
    let timeleft = timelimit;

    updateTimer(timeleft);
    timer = setInterval(function () {
        --timeleft;
        updateTimer(timeleft);
        if (timeleft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame(){
    clearInterval(timer);
    document.getElementById("settings").style.display = "block";
    document.getElementById("game").style.display = "none";
    let seedElement = document.getElementById("seed");
    seedElement.value = String(Math.floor(Math.random() * 10000));
    setSearchParams(seedElement.value);
}

function startGame() {
    document.getElementById("settings").style.display = "none";

    score = 0;
    document.getElementById("score-value").innerHTML = String(score);

    let seed = document.getElementById("seed").value;
    buildDeck(seed);

    if(document.getElementById("has-timelimit").checked) {
        let timelimit = document.getElementById("timelimit").value;
        setTimer(timelimit);
    } else updateTimer(0);

    document.getElementById("game").style.display = "block";
}

function nextCard() {
    let currentCard = document.getElementById(`card${currentCardId}`);

    let prevCardId = (cardCount + currentCardId - 1) % cardCount;
    let prevCard = document.getElementById(`card${prevCardId}`);

    let nextCardId = (currentCardId + 1) % cardCount;
    let nextCard = document.getElementById(`card${nextCardId}`);

    prevCard.classList.remove('animated-card');
    prevCard.classList.add('back-card');

    nextCard.classList.add('front-card');
    nextCard.classList.remove('back-card');

    currentCard.classList.remove('front-card');
    currentCard.classList.add('animated-card');

    currentCardId = nextCardId;
}

function failedCard(){
    score -= 1;
    document.getElementById("score-value").innerHTML = String(score);
    nextCard();
}

function skipCard(){
    nextCard();
}

function guessedCard(){
    score += 1;
    document.getElementById("score-value").innerHTML = String(score);
    nextCard();
}

function setSearchParams(seed){
    url = new URL(window.location.href);
    url.searchParams.set("seed", seed);
    //window.location.href = currentUrl;
    window.history.replaceState({}, document.title, url);
}

function init(){
    let seedElement = document.getElementById("seed");
    let params = new URLSearchParams(window.location.search);
    if(params.get('seed')) seedElement.value = params.get('seed');
    else seedElement.value = String(Math.floor(Math.random() * 10000));

    setSearchParams(seedElement.value);
    seedElement.addEventListener('change', (event) => {
        setSearchParams(seedElement.value);
    });
}

init();
