import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 8;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = "";
let allGuesses = [];
let allWordGuesses = [];
var now = new Date();
var fullDaysSinceEpoch = Math.floor(now / 8.64e7);

var stewsbd = new Date('2024-11-28');
//var owensbd = new Date('2024-11-28');
var owenDay = Math.floor(stewsbd / 8.64e7);
console.log("owen day="+owenDay.toString()+" current:"+fullDaysSinceEpoch.toString());

var day0forGame = owenDay;
var daySinceGameStart = fullDaysSinceEpoch -day0forGame;
let indexForTodaysWord = daySinceGameStart % WORDS.length;
console.log("day=" + daySinceGameStart.toString() + " index=" + indexForTodaysWord.toString());
if(indexForTodaysWord>=0)
	rightGuessString = WORDS[indexForTodaysWord];
console.log(rightGuessString);
let succeeded = false;

let highestStreak = 0;
let currentStreak = 0;
let lastSuccessDay = 0;
let totalWins = 0;
let totalDaysAttempted = 0;

let guessOn = [0,0,0,0,0,0,0,0];
var correctGuessIndex = -1;

const zeroPad = (num, places) => String(num).padStart(places, '0')

const varpfx = "mug_";

let dates = [
    {
        "specialDate": "06/09",
        "message": "Happy Birthday Harvey!"
    },
    {
        "specialDate": "23/10",
        "message": "Happy Birthday Deb!"
    },
    {
        "specialDate": "27/12",
        "message": "Happy Birthday Owen!"
    },
    {
        "specialDate": "10/02",
        "message": "Happy Anniversary Deb & Stew!"
    },
    {
        "specialDate": "07/08",
        "message": "Happy Birthday Cole!"
    },
    {
        "specialDate": "25/12",
        "message": "Merry Christmas!"
    },
    {
        "specialDate": "01/01",
        "message": "Happy New Year!"
    },
    {
        "specialDate": "31/07",
        "message": "Happy Birthday Harry!"
    },
    {
        "specialDate": "30/07",
        "message": "Happy Birthday Neville!"
    },
    {
        "specialDate": "09/01",
        "message": "Happy Birthday Severus!"
    },
    {
        "specialDate": "26/01",
        "message": "Happy Birthday Gilderoy!"
    },
    {
        "specialDate": "30/01",
        "message": "Happy Birthday Lily!"
    },
    {
        "specialDate": "10/03",
        "message": "Happy Birthday Remus!"
    },
    {
        "specialDate": "01/04",
        "message": "Happy Birthday Fred & George!"
    },
    {
        "specialDate": "27/03",
        "message": "Happy Birthday James!"
    },
    {
        "specialDate": "23/06",
        "message": "Happy Birthday Dudley! Hope you have lots of presents!"
    },
    {
        "specialDate": "11/08",
        "message": "Happy Birthday Ginny!"
    },
    {
        "specialDate": "03/11",
        "message": "Happy Birthday Sirius!"
    },
    {
        "specialDate": "06/12",
        "message": "Happy Birthday Hagrid!"
    },
    {
        "specialDate": "31/12",
        "message": "Happy Birthday Voldem....sorry Tom!"
    },
	{
        "specialDate": "19/09",
        "message": "Happy Birthday Hermione!"
    },
    {
        "specialDate": "28/06",
        "message": "Happy Birthday Dobby!"
    },
    {
        "specialDate": "05/06",
        "message": "Happy Birthday Draco!"
    },
    {
        "specialDate": "13/02",
        "message": "Happy Birthday Luna!"
    },
    {
        "specialDate": "01/03",
        "message": "Happy Birthday Ron!"
    }

];

function loadHistory() {
	let historydiv= document.getElementById("history-list");
	
	  let list = document.getElementById("myList");
	  if(list.children.length>0)
		  return;
        for (let i = indexForTodaysWord-1; i>=0 ; --i) {
            let li = document.createElement('li');
            li.innerText = i.toString()+' : '+WORDS[i].toUpperCase();
            list.appendChild(li);
        }
}

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < rightGuessString.length; j++) {
            let box = document.createElement("div");
            if (isSpecialCharacter(rightGuessString[j])) {
                box.className = "space-box";
                box.textContent = rightGuessString[j];
            }
            else
                box.className = "letter-box";

            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

function isSpecialCharacter(c) {
    return " -'/.".includes(c);
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
			let oldColor = elem.style.backgroundColor;
            if (oldColor === "green") {
                return;
            }

            if (oldColor === "orange" && color !== "green") {
                return;
            }

            if (color === "green" || color === "gray")
                elem.style.color = "white";            

            elem.style.backgroundColor = color;
            break;
        }
    }
}


function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;

    // this only handles single special characters - if there were two together we would need to make this a loop
    if (isSpecialCharacter(rightGuessString[nextLetter])) {
        console.log('delete special one!');
        let box = row.children[nextLetter - 1];
        box.textContent = "";
        box.classList.remove("filled-box");
        currentGuess.pop();
        nextLetter -= 1;
    }
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

function replaceAtIndex(guess,index,replacement)
{
    var newGuess =[];
    for(let i=0;i<guess.length;i++)
    {
        if(i==index)
            newGuess.push(replacement);
        else newGuess.push(guess[i]);
    }

    return newGuess;
}

// change to check guess (index)
function checkGuess(rowIndex) {
    let row = document.getElementsByClassName("letter-row")[rowIndex];
    let guessString = "";
    let rightGuess = Array.from(rightGuessString);
    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != rightGuessString.length) {
        toastr.error("Not enough letters!");
        return;
    }

    /*if (!WORDS.includes(guessString)) {
      toastr.error("Word not in list!");
      return;
    }*/

    allWordGuesses.push(guessString);

    var letterColor = [];
    for (let lc = 0; lc < rightGuessString.length; lc++)
        letterColor.push("gray");

    // check green
    for (let i = 0; i < rightGuessString.length; i++) {
        if (rightGuess[i] === currentGuess[i]) {
            letterColor[i] = "green";
            rightGuess[i] = "#";
            currentGuess = replaceAtIndex(currentGuess, i, "#");
        }
    }

    //check yellow
    //checking guess letters
    for (let guessIndex = 0; guessIndex < currentGuess.length; guessIndex++) {
        for (let answerIndex = 0; answerIndex < rightGuess.length; answerIndex++) {
            if (letterColor[answerIndex] == "green")
                continue;
            if (rightGuess[answerIndex] === "#")
                continue;
            if (rightGuess[answerIndex] === currentGuess[guessIndex]) {
                letterColor[guessIndex] = "orange";
                rightGuess[answerIndex] = "#";

                currentGuess = replaceAtIndex(currentGuess, guessIndex, "#");
                continue;

            }
        }
    }

    // Build colour boxes for share data
    let colorBoxes = [];
    for (let i = 0; i < letterColor.length; i++) {
        if (isSpecialCharacter(rightGuessString[i]))
            colorBoxes.push(rightGuessString[i]);
        else {
            if (letterColor[i] === "green")
                colorBoxes.push("🟩");
            else if (letterColor[i] === "orange")
                colorBoxes.push("🟨");
            else
                colorBoxes.push("⬛");
        }
    }

    allGuesses.push(colorBoxes);

    for (let i = 0; i < rightGuessString.length; i++) 
	{
        if (isSpecialCharacter(rightGuessString[i])) continue;
        let box = row.children[i];
        let delay = 125 * i;
        setTimeout(() => {
            //flip box
            animateCSS(box, "flipInX");
            //shade box
            box.style.backgroundColor = letterColor[i];
            shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
        }, delay);
    }

    if (guessString === rightGuessString) {
        succeeded = true;

        if (lastSuccessDay != indexForTodaysWord) {
			console.log("Guessed correct with guess#"+(NUMBER_OF_GUESSES-guessesRemaining).toString());
			correctGuessIndex = NUMBER_OF_GUESSES-guessesRemaining;
			guessOn[correctGuessIndex]++;
			
            // increase streak
            totalWins++;
            totalDaysAttempted++;
            currentStreak++;
            if (currentStreak > highestStreak)
                highestStreak = currentStreak;
            lastSuccessDay = indexForTodaysWord;
        }
		
		guessesRemaining = 0;

        showResult(rightGuessString);

        storeSession();
		
		updateChart();

        return;
    } else {
		hideChart();
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;


        if (guessesRemaining === 0) {

            totalDaysAttempted++;
            currentStreak = 0;

            showResult(rightGuessString);
        }

        storeSession();
    }
}

function hideChart()
{
	const ctx = document.getElementById('chartBox');
	ctx.style.display = "none";
}

function updateChart()
{
	const ctx = document.getElementById('myChart');
	var barColors = [];
	
	for(let i=0;i<NUMBER_OF_GUESSES;i++)
	{
		if(i===correctGuessIndex)
			barColors.push("green");
		else
			barColors.push("gray");
	}

	new Chart(ctx, {
		type: 'bar',
	
    data: {
      labels: ['1', '2', '3', '4', '5', '6','7','8'],
      datasets: [{
        label: '',
        data: guessOn,
		backgroundColor:barColors,
        borderWidth: 0,
		
      }]
    },
    options: {
		plugins: {
			legend: {
				display: false
			},
			 datalabels: {
                anchor: 'end', // Position of the labels (start, end, center, etc.)
                align: 'end', // Alignment of the labels (start, end, center, etc.)
                color: 'black', // Color of the labels
                font: {
                    weight: 'bold',
                },
                formatter: Math.round
                
            }
		},
		indexAxis:'y',
		scaleShowValues: true,
		 scales: {
			 x: {
        grid: {
          display: false,
        }
			 },
			 y: {
        grid: {
          display: false,
        }
			 }
    }
		
	}	
  });
  
  	const charBox = document.getElementById('chartBox');
	charBox.style.display = "block";
}

function showResult(correctWord) {
    if(succeeded)
    {
        document.getElementById("myForm").style.backgroundColor = 'rgb(112, 216, 91)';         
        document.getElementById("resultLabel").innerText = "You guessed right! Current streak:"+currentStreak.toString();        
    }
    else
    {
        document.getElementById("myForm").style.backgroundColor = 'rgb(247, 47, 40)'; 
        document.getElementById("resultLabel").innerText = "You've run out of guesses! Game over!";
    }

    document.getElementById("correctWord").innerText = correctWord;
    document.getElementById("myForm").style.display = "grid";
	
    updateStats();
}

function updateStats()
{
    let winperc = Math.floor((totalWins ) / (totalDaysAttempted) * 100);
    console.log("Perc:"+winperc.toString());
    if (isNaN(winperc))
        winperc = 0;
    (document.getElementById("game-stats")).innerText = "Attempts: " + totalDaysAttempted.toString() + "  Wins:" + totalWins.toString() + " (" + winperc.toString() + "%)";
try{
	document.getElementById("stat_played").innerText = totalDaysAttempted.toString();
	document.getElementById("stat_wonperc").innerText = winperc.toString();
	document.getElementById("stat_streak").innerText = currentStreak.toString();
	document.getElementById("stat_maxstreak").innerText = highestStreak.toString();
}
catch(err)
{
	document.getElementById("correctWord").innerText = err.message;
}

}

function insertLetter(pressedKey) {
    if (!((pressedKey.charCodeAt(0) >= 48 && pressedKey.charCodeAt(0) <= 57) || (pressedKey.charCodeAt(0) >= 97 && pressedKey.charCodeAt(0) <= 122))) {
        console.log('not valid character');
        return;
    }

    if (nextLetter === rightGuessString.length) {
        console.log("hit end of length of [" + rightGuessString + "] nextLetter=" + nextLetter.toString());
        return;
    }

    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let box = row.children[nextLetter];
    animateCSS(box, "pulse");
    box.textContent = pressedKey;

    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
    if (isSpecialCharacter(rightGuessString[nextLetter])) {
        console.log("jumping over next character as it is special " + rightGuessString[nextLetter]);
        currentGuess.push(rightGuessString[nextLetter]);
        nextLetter += 1;
    }

    storeSession();
}

function storeSession() {
    localStorage.setItem("mug_allWordGuesses", JSON.stringify(allWordGuesses));
    localStorage.setItem("mug_indexForTodaysWord", JSON.stringify(indexForTodaysWord));

    localStorage.setItem("mug_currentStreak", JSON.stringify(currentStreak));
    localStorage.setItem("mug_lastSuccessDay", JSON.stringify(lastSuccessDay));
	
	localStorage.setItem("mug_highestStreak", JSON.stringify(highestStreak));
	
	localStorage.setItem("mug_totalWins", JSON.stringify(totalWins));
	localStorage.setItem("mug_totalDaysAttempted", JSON.stringify(totalDaysAttempted));
	for(let i=0;i<NUMBER_OF_GUESSES;i++)
	{
		localStorage.setItem("mug_guessOn_"+(i+1).toString(), JSON.stringify(guessOn[i]));
	}
	
	localStorage.setItem("mug_currentCorrectIndex", JSON.stringify(correctGuessIndex));
}

const animateCSS = (element, animation, prefix = "animate__") =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        // const node = document.querySelector(element);
        const node = element;
        node.style.setProperty("--animate-duration", "0.3s");

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve("Animation ended");
        }

        node.addEventListener("animationend", handleAnimationEnd, { once: true });
    });

document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) {
        return;
    }

    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess(NUMBER_OF_GUESSES - guessesRemaining);
        return;
    }

    let found = pressedKey.match(/[a-z0-9]/gi);
    
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey);
    }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
        return;
    }

    let key = target.textContent;

    if(target.id==="del-button")
    {
        console.log("delete!");
        key = "Backspace";
    }

    document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

document.getElementById("Options-Row").addEventListener("click", (e) => {
    const target = e.target;
	if( target.classList.contains("history-button"))
	{
		console.log("show history");
		loadHistory();
		return;
	}
});

document.getElementById("myForm").addEventListener("click", (e) => {
    const target = e.target;
    console.log(target.classList);
    if (target.classList.contains("fa-close") ||
        target.classList.contains("close-btn")) {
        console.log("close!");
        document.getElementById("myForm").style.display = "none";
        return;
    }

    if (target.classList.contains("lookup-btn")) {
		const newURL = new URL("http://google.com/search");		
		newURL.searchParams.set("q", rightGuessString + " harry potter");
		window.open(newURL, '_blank').focus();
        return;
    }

    if (!target.classList.contains("share-btn")) {
        return;
    }

    let textToShare = "Muggle " + indexForTodaysWord.toString();
    if (succeeded) 
    {
        textToShare = textToShare + " " + allGuesses.length.toString() + "/"+NUMBER_OF_GUESSES+"\r\n";
        textToShare = textToShare + "Streak: " + currentStreak.toString()+"\r\n";
    }
    else 
        textToShare = textToShare + " X/"+NUMBER_OF_GUESSES+"\r\n";
    for (let i = 0; i < allGuesses.length; i++) {
        for (let l = 0; l < allGuesses[i].length; l++) {
            textToShare = textToShare + allGuesses[i][l];
        }

        textToShare = textToShare + "\r\n";
    }

    console.log(textToShare);

    if (navigator.share) {
        navigator.share({
            text: textToShare,
            title: 'Muggle result',
        }).then(() => {
            console.log('Thanks for sharing!');
        })
            .catch(console.error);
    } else {
        // fallback
    }

});

window.onload = function () {
	
	if( owenDay>fullDaysSinceEpoch)
	{
		console.log("no ready yet");
		(document.getElementById("game-number")).innerText = "Game starts on 28/11/2024";
		(document.getElementById("game-stats")).innerText ="";
		(document.getElementById("keyboard-cont")).style.display = "none";
		(document.getElementById("Options-Row")).style.display = "none";
		
		return;
	}
    const totalbackgrounds = 9; // 0-19
    console.log('background' + ((indexForTodaysWord + 52) % totalbackgrounds).toString());

    var urlstring = 'url(images/background' + (indexForTodaysWord % totalbackgrounds) + '.jpg)';
    console.log(urlstring);

    $('body').css('background-image', 'url(images/background' + (indexForTodaysWord % totalbackgrounds) + '.jpg)');


    let tempWordGuesses = JSON.parse(localStorage.getItem("mug_allWordGuesses"));
    currentStreak = JSON.parse(localStorage.getItem("mug_currentStreak",));
    lastSuccessDay = JSON.parse(localStorage.getItem("mug_lastSuccessDay"));
    highestStreak = JSON.parse(localStorage.getItem("mug_highestStreak",));
    totalWins = JSON.parse(localStorage.getItem("mug_totalWins",));
    totalDaysAttempted = JSON.parse(localStorage.getItem("mug_totalDaysAttempted",));

	correctGuessIndex = JSON.parse(localStorage.getItem("mug_currentCorrectIndex",));
	
	for(let i=0;i<NUMBER_OF_GUESSES;i++)
	{
		guessOn[i] = JSON.parse(localStorage.getItem("mug_guessOn_"+(i+1).toString()));
	}

    if (totalDaysAttempted === null) totalDaysAttempted = 0;
    if (totalWins === null) totalWins = 0;
    if (currentStreak === null) currentStreak = 0;
    if (lastSuccessDay === null) lastSuccessDay = 0;
    if (highestStreak === null) highestStreak = 0;

    if (!(indexForTodaysWord === 0 && lastSuccessDay === WORDS.length - 1) &&
        indexForTodaysWord - lastSuccessDay > 1) {
        console.log("Streak ended - not played for at least a day");
        currentStreak = 0;
    }

    if (tempWordGuesses === null || localStorage.getItem("mug_indexForTodaysWord") != indexForTodaysWord) {
        console.log("resetting guess");
    }
    else {
        for (let i = 0; i < tempWordGuesses.length; i++) {
            let row = document.getElementsByClassName("letter-row")[i];
            currentGuess = tempWordGuesses[i];
            for (let l = 0; l < tempWordGuesses[i].length; l++) {
                let box = row.children[l];
                animateCSS(box, "pulse");
                box.textContent = tempWordGuesses[i][l];
                box.classList.add("filled-box");
            }

            checkGuess(NUMBER_OF_GUESSES - guessesRemaining);
        }
    }

    const d = new Date();
    let dateString = zeroPad(d.getDate(), 2) + "/" + zeroPad(d.getMonth() + 1, 2);
    console.log("date=" + dateString);
    let specialDate = dates.find(d => d.specialDate === dateString);
    if (!specialDate && d.getDay() == 2)
        specialDate = { "message": "Happy Bin Night!" };
    if (specialDate) {
        (document.getElementById("special-date")).innerText = specialDate.message;
    }

    (document.getElementById("game-number")).innerText = "Game: " + indexForTodaysWord.toString() + " / " + WORDS.length.toString() + " Streak:" + currentStreak.toString() + " Best Streak:" + highestStreak.toString();
    updateStats();
}

initBoard();
