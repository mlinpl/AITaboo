
var currentCardId = 0;
var cardCount = 0;
var score = 0;

function LCG(s) {
    return function() {
        s = Math.imul(48271, s) | 0 % 2147483647;
        return (s & 2147483647) / 2147483648;
    }
}

function shuffle(array, seed) {
    let rand = LCG(seed);

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
    let shuffled = shuffle([... cards]);

    let deckHTML = "";
    for(let i = 0; i < shuffled.length; ++i){
        let card = shuffled[i];
        deckHTML += `<div id="card${i}" class="card" style="z-index: ${-i}"><div class="card-word">${card['word']}</div>`;
        for(let j = 0; j < card['taboo'].length; ++j){
            deckHTML += `<div class="card-taboo">${card['taboo'][j]}</div>`;
        }
        deckHTML += '</div>';
    }
    console.log(deckHTML);
    document.getElementById("deck").innerHTML = deckHTML;

    currentCardId = 0;
    cardCount = shuffled.length;
}

function updateTimer(timeleft){
    let min = String(Math.floor(timeleft / 60)).padStart(1, '0');
    let sec = String(timeleft % 60).padStart(2, '0');
    document.getElementById("timer-value").innerHTML = min + ":" + sec;
}

function setTimer(timelimit){
    let timeleft = timelimit;

    updateTimer(timeleft % 60);
    let x = setInterval(function () {
        --timeleft;
        updateTimer(timeleft % 60);
        if (timeleft <= 0) {
            clearInterval(x);
            endGame();
        }
    }, 1000);
}

function endGame(){
    document.getElementById("settings").style.display = "block";
    document.getElementById("game").style.display = "none";
    document.getElementById("seed").value = String(Math.floor(Math.random() * 10000));
}

function startGame() {
    document.getElementById("settings").style.display = "none";

    score = 0;
    document.getElementById("score-value").innerHTML = String(score);

    let seed = document.getElementById("seed").value;
    buildDeck(1);

    if(document.getElementById("has-timelimit").checked) {
        let timelimit = document.getElementById("timelimit").value;
        setTimer(timelimit);
    }

    document.getElementById("game").style.display = "block";
}

function nextCard() {
    let currentCard = document.getElementById(`card${currentCardId}`);
    let nextCardId = (currentCardId + 1) % cardCount;
    let nextCard = document.getElementById(`card${nextCardId}`);

    currentCard.style.zIndex = "0";

    nextCard.style.zIndex = "-1";
    nextCard.classList.remove('animated-card');

    currentCard.classList.add('animated-card');
    currentCard.style.zIndex = "-100";

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

function init(){
    let seedElement = document.getElementById("seed");
    let params = new URLSearchParams(window.location.search);
    if(params.get('seed')) seedElement.value = params.get('seed');
    else seedElement.value = String(Math.floor(Math.random() * 10000));

    seedElement.addEventListener('change', (event) => {
        url = new URL(window.location.href);
        url.searchParams.set("seed", seedElement.value);
        //window.location.href = currentUrl;
        window.history.replaceState({}, document.title, url);
    });
}

init();
