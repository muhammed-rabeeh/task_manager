let tasks = [];
let completedTasks = [];
let currentUser = null;
let dailyRoutines = [];
const routineTrackerKey = 'routineTracker';
let completedRoutines = []; 
let timeUtilized = 0;
const dayStartTime = 6 * 60 * 60 * 1000; // 6:00 AM in milliseconds
const sixteenHours = 16 * 60 * 60 * 1000; // 16 hours in milliseconds

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        loadUserData();
        showTaskContainer();
        loadRoutineTracker();
    } else {
        showSignInContainer();
    }

    // Initialize completedRoutines if it doesn't exist in localStorage
    if (!localStorage.getItem(routineTrackerKey)) {
        completedRoutines = [];
        saveRoutineTracker();
    }
}

function showData() {
    const popup = document.getElementById("popup-table");
    popup.style.display = "flex";
    updatePopupTable(); 
}

function hideData() {
    const popup = document.getElementById("popup-table");
    popup.style.display = "none";
}


function showTaskContainer() {
    document.getElementById("signin-container").style.display = "none";
    document.getElementById("task-container").style.display = "block";
    document.getElementById("daily-routine-container").style.display = "block";
    document.getElementById("random-task-display").style.display="none";
    document.getElementById("current-user").textContent = `Logged in as: ${currentUser}`;
    loadTasks();
    loadTimeUtilized();
    startClock();
    startDayTimer();
    resetDaySummary();
}

function addDailyRoutine() {
    const dayName = document.getElementById("daily-routine-day").value.trim();
    if (dayName) {
        const routine = {
            day: dayName,
            routines: [],
            done: false
        };
        dailyRoutines.push(routine);
        renderDailyRoutines();
        document.getElementById("daily-routine-day").value = "";
        saveRoutineTracker();
    }
}

function renderDailyRoutines() {
    const dailyRoutineList = document.getElementById("daily-routine-list");
    dailyRoutineList.innerHTML = "";
    dailyRoutines.forEach((routine, index) => {
        const routineItem = document.createElement("div");
        routineItem.className = "daily-routine-item";

        const dayName = document.createElement("span");
        dayName.className = `day-name ${routine.done ? 'done-routine' : ''}`;
        dayName.textContent = routine.day;

        const addRoutineButton = document.createElement("button");
        addRoutineButton.textContent = "Add Routine";
        addRoutineButton.onclick = () => addRoutine(index);

        const markDoneButton = document.createElement("button");
        markDoneButton.textContent = "Done";
        markDoneButton.onclick = () => markDailyRoutineDone(index);

        const refreshButton = document.createElement("button");
        refreshButton.textContent = "Refresh";
        refreshButton.style.backgroundColor="black";
        refreshButton.onclick = () => refreshRoutine(index);

        const routinesContainer = document.createElement("div");
        routinesContainer.className = "routines";

        routine.routines.forEach((r, rIndex) => {
            const routineDiv = document.createElement("div");
            routineDiv.className = "routine";

            const routineName = document.createElement("span");
            routineName.textContent = r.name;
            routineName.className = `${r.done ? 'done-routine' : ''}`;

            const markCompleteCheckbox = document.createElement("input");
            markCompleteCheckbox.type = "checkbox";
            markCompleteCheckbox.checked = r.done;
            markCompleteCheckbox.onchange = () => markRoutineDone(index, rIndex);

            routineDiv.appendChild(routineName);
            routineDiv.appendChild(markCompleteCheckbox);

            routinesContainer.appendChild(routineDiv);
        });

        routineItem.appendChild(dayName);
        routineItem.appendChild(addRoutineButton);
        routineItem.appendChild(markDoneButton);
        routineItem.appendChild(refreshButton);
        routineItem.appendChild(routinesContainer);

        dailyRoutineList.appendChild(routineItem);
    });
}


function refreshRoutine(dailyRoutineIndex) {
    // Mark current routine as done
    const completedRoutine = { ...dailyRoutines[dailyRoutineIndex] };
    completedRoutine.done = true;
    completedRoutine.routines.forEach(r => r.done = true);

    // Move completed routine to completedRoutines array
    completedRoutines.push(completedRoutine);

    // Create a new copy of the current routine
    const newRoutine = JSON.parse(JSON.stringify(dailyRoutines[dailyRoutineIndex]));
    newRoutine.done = false;
    newRoutine.routines.forEach(r => r.done = false);

    // Replace the old routine with the new one
    dailyRoutines[dailyRoutineIndex] = newRoutine;

    // Update the UI
    renderDailyRoutines();
    renderCompletedRoutines();

    // Save the updated state
    saveRoutineTracker();
}

function renderCompletedRoutines() {
    const trackerList = document.getElementById("routine-tracker-list");
    trackerList.innerHTML = ""; // Clear existing items
    completedRoutines.forEach(routine => {
        const listItem = document.createElement("li");
        listItem.textContent = `${routine.day} - Completed on ${new Date().toLocaleDateString()}`;
        trackerList.appendChild(listItem);
    });
}

function addRoutine(dailyRoutineIndex) {
    const routineName = prompt("Enter the routine name:");
    if (routineName) {
        const routine = {
            name: routineName,
            done: false
        };
        dailyRoutines[dailyRoutineIndex].routines.push(routine);
        renderDailyRoutines();
        saveRoutineTracker();
    }
}

function markRoutineDone(dailyRoutineIndex, routineIndex) {
    dailyRoutines[dailyRoutineIndex].routines[routineIndex].done = !dailyRoutines[dailyRoutineIndex].routines[routineIndex].done;
    renderDailyRoutines();
    saveRoutineTracker();
}

function markDailyRoutineDone(dailyRoutineIndex) {
    dailyRoutines[dailyRoutineIndex].done = true;
    dailyRoutines[dailyRoutineIndex].routines.forEach(r => r.done = true);
    renderDailyRoutines();
    addRoutineToTracker(dailyRoutines[dailyRoutineIndex]);
    saveRoutineTracker();
}


function addRoutineToTracker(routine) {
    const trackerList = document.getElementById("routine-tracker-list");
    const listItem = document.createElement("li");
    listItem.textContent = `${routine.day} - Completed on ${new Date().toLocaleDateString()}`;
    trackerList.appendChild(listItem);
}



function saveRoutineTracker() {
    const dataToSave = {
        activeRoutines: dailyRoutines,
        completedRoutines: completedRoutines
    };
    localStorage.setItem(routineTrackerKey, JSON.stringify(dataToSave));
}

function loadRoutineTracker() {
    const savedRoutineTracker = localStorage.getItem(routineTrackerKey);
    if (savedRoutineTracker) {
        const parsedData = JSON.parse(savedRoutineTracker);
        dailyRoutines = parsedData.activeRoutines || [];
        completedRoutines = parsedData.completedRoutines || [];
    } else {
        dailyRoutines = [];
        completedRoutines = [];
    }
    renderDailyRoutines();
    renderCompletedRoutines();
}


function showSignInContainer() {
    document.getElementById("signin-container").style.display = "block";
    document.getElementById("task-container").style.display = "none";
}

function signIn() {
    const username = document.getElementById("username").value.trim();
    if (username) {
        localStorage.setItem("currentUser", username);
        currentUser = username;
        loadUserData();
        showTaskContainer();
    }
}

function loadUserData() {
    loadTasks();
    loadTimeUtilized();
    loadCompletedTasks();
}

function loadCompletedTasks() {
    const savedCompletedTasks = localStorage.getItem(`completedTasks_${currentUser}`);
    if (savedCompletedTasks) {
        completedTasks = JSON.parse(savedCompletedTasks);
    }
}

function signOut() {
    currentUser = null;
    tasks = [];
    completedTasks = [];
    timeUtilized = 0;
    showSignInContainer();
    document.getElementById("username").value = "";
    document.getElementById("task-list").innerHTML = "";
    document.getElementById("random-task-display").textContent = "";
    document.getElementById("current-user").textContent="";
    updateTimeUtilizedDisplay();
    localStorage.removeItem("currentUser");
}


function loadTasks() {
    const savedTasks = localStorage.getItem(`tasks_${currentUser}`);
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
    localStorage.setItem(`timeUtilized_${currentUser}`, timeUtilized.toString());
    updateTimeUtilizedDisplay();
    alert("Tasks and time utilized saved successfully.");
}


function updateTimeUtilizedDisplay() {
    const utilizedHours = Math.floor(timeUtilized / 3600);
    const utilizedMinutes = Math.floor((timeUtilized % 3600) / 60);
    const utilizedSeconds = timeUtilized % 60;
    document.getElementById("time-utilized-box").textContent = 
        `Time Utilized: ${utilizedHours}h ${utilizedMinutes}m ${utilizedSeconds}s`;
}

function saveTimeUtilized() {
    localStorage.setItem(`timeUtilized_${currentUser}`, timeUtilized.toString());
}
// Get current day start time (06:00:00 AM)
function getCurrentDayStartTime() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
    return startOfDay.getTime();
}

// Load or initialize time left in the day
function initializeDayTimer() {
    const now = Date.now();
    const dayStart = getCurrentDayStartTime();
    const timeElapsedSinceDayStart = now - dayStart;
    const timeLeftInMillis = Math.max(sixteenHours - timeElapsedSinceDayStart, 0);

    resetDaySummary();

    localStorage.setItem("timeLeftInMillis", timeLeftInMillis);
    return timeLeftInMillis;
}



function addTask() {
    const taskInput = document.getElementById("task-input");
    const taskName = taskInput.value.trim();
    if (taskName) {
        const task = {
            name: taskName,
            steps: [],
            done: false
        };
        tasks.push(task);
        renderTasks();
        taskInput.value = "";
    }
}

function renderTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        const taskItem = document.createElement("li");

        const taskName = document.createElement("span");
        taskName.className = `task-name ${task.done ? 'done-task' : ''}`;
        taskName.textContent = task.name;

        const addStepButton = document.createElement("button");
        addStepButton.textContent = "Add Steps";
        addStepButton.onclick = () => addStep(index);

        const removeTaskButton = document.createElement("button");
        removeTaskButton.textContent = "Remove Task";
        removeTaskButton.className = "remove-task";
        removeTaskButton.onclick = () => removeTask(index);

        const markDoneButton = document.createElement("button");
        markDoneButton.textContent = "Done";
        markDoneButton.onclick = () => markTaskDone(index);

        const stepsContainer = document.createElement("div");
        stepsContainer.className = "steps";

        task.steps.forEach((step, stepIndex) => {
            const stepDiv = document.createElement("div");
            stepDiv.className = "step";

            const stepName = document.createElement("span");
            stepName.textContent = step.name;
            stepName.className = `${step.done ? 'done-task' : ''}`;

            const timer = document.createElement("span");
            timer.className = "timer-box";
            timer.textContent = formatTime(step.time);

            const startButton = document.createElement("button");
            startButton.textContent = "Start Timer";
            startButton.className = "start-timer";
            startButton.onclick = () => startTimer(index, stepIndex, timer);

            const stopButton = document.createElement("button");
            stopButton.textContent = "Stop Timer";
            stopButton.className = "stop-timer";
            stopButton.onclick = () => stopTimer(index, stepIndex);

            const removeStepButton = document.createElement("button");
            removeStepButton.textContent = "Remove Step";
            removeStepButton.onclick = () => removeStep(index, stepIndex);

            const markStepDoneButton = document.createElement("button");
            markStepDoneButton.textContent = "Done";
            markStepDoneButton.onclick = () => markStepDone(index, stepIndex);

            stepDiv.appendChild(stepName);
            stepDiv.appendChild(timer);
            stepDiv.appendChild(startButton);
            stepDiv.appendChild(stopButton);
            stepDiv.appendChild(removeStepButton);
            stepDiv.appendChild(markStepDoneButton);

            stepsContainer.appendChild(stepDiv);
        });

        taskItem.appendChild(taskName);
        taskItem.appendChild(addStepButton);
        taskItem.appendChild(removeTaskButton);
        taskItem.appendChild(markDoneButton);
        taskItem.appendChild(stepsContainer);

        taskList.appendChild(taskItem);
    });
}

function addStep(taskIndex) {
    const stepName = prompt("Enter the step name:");
    if (stepName) {
        const step = {
            name: stepName,
            time: 0,
            timer: null,
            done: false
        };
        tasks[taskIndex].steps.push(step);
        renderTasks();
    }
}

function startTimer(taskIndex, stepIndex, timerElement) {
    const step = tasks[taskIndex].steps[stepIndex];
    if (!step.timer) {
        step.timer = setInterval(() => {
            step.time++;
            timeUtilized++;
            timerElement.textContent = formatTime(step.time);
            updateTimeUtilizedDisplay();
        }, 1000);
    }
}

function stopTimer(taskIndex, stepIndex) {
    const step = tasks[taskIndex].steps[stepIndex];
    if (step.timer) {
        clearInterval(step.timer);
        step.timer = null;
        saveTasks();
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function removeTask(taskIndex) {
    tasks.splice(taskIndex, 1);
    renderTasks();
}

function removeStep(taskIndex, stepIndex) {
    tasks[taskIndex].steps.splice(stepIndex, 1);
    renderTasks();
}


function markTaskDone(taskIndex) {
    tasks[taskIndex].done = true;
    tasks[taskIndex].steps.forEach(step => step.done = true);
    completedTasks.push(tasks[taskIndex]);
    renderTasks();
    updatePopupTable();
    saveCompletedTasks();
}

function saveCompletedTasks() {
    localStorage.setItem(`completedTasks_${currentUser}`, JSON.stringify(completedTasks));
}

function markStepDone(taskIndex, stepIndex) {
    tasks[taskIndex].steps[stepIndex].done = true;
    renderTasks();
    updatePopupTable();
    saveCompletedTasks();
}

function selectRandomTask() {
    if (tasks.length > 0) {
        document.getElementById("random-task-display").style.display="block";
        const randomIndex = Math.floor(Math.random() * tasks.length);
        const randomTask = tasks[randomIndex];
        document.getElementById("random-task-display").textContent = `Selected Task: ${randomTask.name}`;
    } else {
        alert("No tasks available.");
    }
}


function loadTimeUtilized() {
    timeUtilized = parseInt(localStorage.getItem(`timeUtilized_${currentUser}`)) || 0;
    updateTimeUtilizedDisplay();
}
function updateTimeUtilizedDisplay() {
    const utilizedHours = Math.floor(timeUtilized / 3600);
    const utilizedMinutes = Math.floor((timeUtilized % 3600) / 60);
    const utilizedSeconds = timeUtilized % 60;
    document.getElementById("time-utilized-box").textContent = 
        `Time Utilized: ${utilizedHours}h ${utilizedMinutes}m ${utilizedSeconds}s`;
}

function updatePopupTable() {
    const dataTableBody = document.getElementById("data-table-body");
    dataTableBody.innerHTML = "";

    completedTasks.forEach(task => {
        task.steps.forEach(step => {
            const row = document.createElement("tr");
            const taskCell = document.createElement("td");
            taskCell.textContent = task.name;
            const stepCell = document.createElement("td");
            stepCell.textContent = step.name;
            const timeCell = document.createElement("td");
            timeCell.textContent = formatTime(step.time);
            row.appendChild(taskCell);
            row.appendChild(stepCell);
            row.appendChild(timeCell);
            dataTableBody.appendChild(row);
        });
    });

    document.getElementById("total-tasks").textContent = `Total Tasks: ${tasks.length}`;
    document.getElementById("completed-tasks").textContent = `Tasks Completed: ${completedTasks.length}`;
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        const strTime = `${hours}:${minutes}:${seconds} ${ampm}`;
        document.getElementById("current-time").textContent = strTime;
    }, 1000);
}

function startDayTimer() {
    const timeLeftInMillis = initializeDayTimer();
    let timeLeft = timeLeftInMillis / 1000;

    const dayTimerInterval = setInterval(() => {
        timeLeft--;
        const hoursLeft = Math.floor(timeLeft / 3600);
        const minutesLeft = Math.floor((timeLeft % 3600) / 60);
        const secondsLeft = Math.floor(timeLeft % 60);

        document
            .getElementById("time-left-box").textContent = `Time Left: ${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(dayTimerInterval);
            displayDaySummary();
            resetTimeUtilizedAndTimeLeft();
        }
    }, 1000);
}

function displayDaySummary() {

    const summaryBox = document.getElementById("summary-box");

    // Prepare the summary content
    const utilizedHours = Math.floor(timeUtilized / 3600);
    const utilizedMinutes = Math.floor((timeUtilized % 3600) / 60);
    const utilizedSeconds = timeUtilized % 60;

    let summaryContent = `<strong>Day Summary:</strong><br>`;
    summaryContent += `Total Time Utilized: ${utilizedHours}h ${utilizedMinutes}m ${utilizedSeconds}s<br>`;

    completedTasks.forEach(task => {
        summaryContent += `<br><strong>${task.name}:</strong><br>`;
        task.steps.forEach(step => {
            summaryContent += `${step.name} - ${formatTime(step.time)}<br>`;
        });
    });

    // Display the summary content in the box
    summaryBox.innerHTML = summaryContent;
    summaryBox.style.display = "block";
}

function resetDaySummary() {
    completedTasks = [];
    saveCompletedTasks();
    let summaryContent = `<strong>Day Summary:</strong><br>`;
    summaryContent += `Total Time Utilized: 0h 0m 0s<br>`;
    document.getElementById("summary-box").innerHTML = summaryContent;
}

function resetTimeUtilizedAndTimeLeft() {
    timeUtilized = 0;
    localStorage.setItem(`timeUtilized_${currentUser}`, timeUtilized.toString());
    updateTimeUtilizedDisplay();
    document.getElementById("time-utilized-box").textContent = "Time Utilized: 0h 0m 0s";
    document.getElementById("time-left-box").textContent = "Time Left: 0h 0m 0s";
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/task_manager/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
