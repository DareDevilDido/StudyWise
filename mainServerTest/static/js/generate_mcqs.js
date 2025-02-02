function parseMCQs(data) {
    try {
        const parsedData = JSON.parse(data || '[]');
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        console.error("Failed to parse MCQs:", e);
        return [];
    }
}

// General MCQs
const mcqsE = parseMCQs(sessionStorage.getItem('loadedMCQ_E'));
const mcqsM = parseMCQs(sessionStorage.getItem('loadedMCQ_M'));
const mcqsH = parseMCQs(sessionStorage.getItem('loadedMCQ_H'));
const allMcqs = [...mcqsE, ...mcqsM, ...mcqsH];

let userPoints = 0; // Initialize user points
let fetchTimeout;
let answeredCount = 0; // Variable to track the number of answered questions
let timerInterval;

async function fetchMCQs() {
    try {
        const difficulty = determineDifficulty(userPoints);
        let selectedMCQs;
        if (difficulty === 'easy') {
            selectedMCQs = mcqsE;
        } else if (difficulty === 'medium') {
            selectedMCQs = mcqsM;
        } else {
            selectedMCQs = mcqsH;
        }

        const selectedQuestions = getRandomQuestions(selectedMCQs, 6);
        answeredCount = 0; // Reset the answered count
        displayMCQs(selectedQuestions, 'mcq-container');
    } catch (error) {
        console.error("Failed to fetch MCQs:", error);
    }
}

function fetchAllMCQs() {
    displayMCQs(allMcqs, 'mcq-container-general');
}

function displayMCQs(mcqs, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous content

    mcqs.forEach((mcq, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.textContent = `${index + 1}. ${mcq.question}`;

        const optionsDiv = document.createElement('div');
        mcq.options.forEach((option, optionIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            optionDiv.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option}`;
            optionDiv.onclick = () => handleOptionClick(option, mcq.correct_answer, optionDiv, optionsDiv);
            optionsDiv.appendChild(optionDiv);
        });

        container.appendChild(questionDiv);
        container.appendChild(optionsDiv);
    });
}

function updateUserPoints(correct) {
    if (correct) {
        userPoints += 10;
    } else {
        userPoints -= 5; // Optional: Decrease points for an incorrect answer
    }
    userPoints = Math.max(userPoints, 0); // Ensure points don't go negative
    displayUserPoints();
}

function displayUserPoints() {
    const pointsDisplay = document.getElementById('user-points');
    pointsDisplay.textContent = `Points: ${userPoints}`;
}

function determineDifficulty(points) {
    if (points < 50) return 'easy';
    else if (points < 100) return 'medium';
    else return 'hard';
}

function getRandomQuestions(mcqs, count) {
    if (mcqs.length === 0) return [];
    const shuffled = mcqs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function handleOptionClick(selectedOption, correctAnswer, optionDiv, optionsDiv) {
    const allOptions = optionsDiv.getElementsByClassName('option');
    Array.from(allOptions).forEach(option => {
        option.onclick = null; // Remove click event listener to prevent further clicks
        option.classList.remove('correct', 'incorrect');
    });

    if (selectedOption === correctAnswer) {
        optionDiv.classList.add('correct');
        updateUserPoints(true);
    } else {
        optionDiv.classList.add('incorrect');
        updateUserPoints(false);
        // Highlight the correct answer
        Array.from(allOptions).forEach(option => {
            if (option.textContent.endsWith(correctAnswer)) {
                option.classList.add('correct');
            }
        });
    }
    answeredCount++; // Increment the answered count

    // Check if all questions are answered
    const totalQuestions = document.querySelectorAll('.question').length;
    if (answeredCount === totalQuestions) {
        clearTimeout(fetchTimeout);
        fetchTimeout = setTimeout(fetchMCQs, 5000);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mcq-general-tab').click();
    addCountdownTimer();
    fetchMCQs();
    fetchAllMCQs();
});

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function addCountdownTimer() {
    let timerElement = document.getElementById('countdown-timer');
    if (!timerElement) {
        container = document.getElementById('Filtered');
        timerElement = document.createElement('div');
        timerElement.id = 'countdown-timer';
        container.appendChild(timerElement);
    }
    else {
        clearInterval(timerInterval);
    }
    const threeMinutes = 60 * 3;
    startTimer(threeMinutes, timerElement);
}

// Filtered MCQs
async function fetchFilteredMCQs() {
    try {
        // Retrieve the stored data from local storage
        const mcqsE = JSON.parse(sessionStorage.getItem('loadedMCQ_E') || '[]');
        const mcqsM = JSON.parse(sessionStorage.getItem('loadedMCQ_M') || '[]');
        const mcqsH = JSON.parse(sessionStorage.getItem('loadedMCQ_H') || '[]');

        const difficulty = determineFilteredDifficulty(userPoints);
        let selectedMCQs;
        if (difficulty === 'easy') {
            selectedMCQs = mcqsE;
        } else if (difficulty === 'medium') {
            selectedMCQs = mcqsM;
        } else {
            selectedMCQs = mcqsH;
        }

        // Randomly select 6 questions from the selected difficulty level
        const selectedQuestions = getRandomFilteredQuestions(selectedMCQs, 6);
        displayFilteredMCQs(selectedQuestions);
    } catch (error) {
        console.error("Failed to fetch filtered MCQs:", error);
    }
}

function updateFilteredUserPoints(correct) {
    if (correct) {
        userPoints += 10;
    } else {
        userPoints -= 5; // Optional: Decrease points for an incorrect answer
    }
    userPoints = Math.max(userPoints, 0); // Ensure points don't go negative
    displayFilteredUserPoints();
}

function displayFilteredUserPoints() {
    const pointsDisplay = document.getElementById('user-points-filtered');
    pointsDisplay.textContent = `Points: ${userPoints}`;
}

function determineFilteredDifficulty(points) {
    if (points < 50) return 'easy';
    else if (points < 100) return 'medium';
    else return 'hard';
}

function displayFilteredMCQs(mcqs) {
    const container = document.getElementById('mcq-container-filtered');
    container.innerHTML = ''; // Clear previous content

    mcqs.forEach((mcq, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.textContent = `${index + 1}. ${mcq.question}`;

        const optionsDiv = document.createElement('div');
        mcq.options.forEach((option, optionIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            optionDiv.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option}`;
            optionDiv.onclick = () => handleFilteredOptionClick(option, mcq.correct_answer, optionDiv, optionsDiv);
            optionsDiv.appendChild(optionDiv);
        });

        container.appendChild(questionDiv);
        container.appendChild(optionsDiv);
    });
}

function getRandomFilteredQuestions(mcqs, count) {
    const shuffled = mcqs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function handleFilteredOptionClick(selectedOption, correctAnswer, optionDiv, optionsDiv) {
    const allOptions = optionsDiv.getElementsByClassName('option');
    Array.from(allOptions).forEach(option => {
        // Remove existing event listeners to prevent further clicks
        option.onclick = null;
        option.classList.remove('correct', 'incorrect');
    });

    if (selectedOption === correctAnswer) {
        optionDiv.classList.add('correct');
        updateFilteredUserPoints(true); // Increase points for correct answer
    } else {
        optionDiv.classList.add('incorrect');
        updateFilteredUserPoints(false); // Decrease points for incorrect answer
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchFilteredMCQs();
    // MCQ Submit Listener
    document.getElementById('filtered-mcq-submit').addEventListener('click', function () {
        fetchFilteredMCQs();
        addCountdownTimer();
    });
    // MCQ Filtered Timer Listener
    document.getElementById('mcq-filtered-tab').addEventListener('click', function () {
        addCountdownTimer();
    });
});



function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}