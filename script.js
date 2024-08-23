let tasks = [];
let completedTasks = [];
let currentUser = null;

function signIn() {
    const username = document.getElementById("username").value.trim();
    if (username) {
        currentUser = username;
        loadTasks();
        document.getElementById("signin-container").style.display = "none";
        document.getElementById("task-container").style.display = "block";
    }
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
            stepName.className = `${step.done ? 'done-task' : ''}`;
            stepName.textContent = step.name;
            
            const timer = document.createElement("span");
            timer.textContent = formatTime(step.time);
            
            const startButton = document.createElement("button");
            startButton.textContent = "Start Timer";
            startButton.onclick = () => startTimer(index, stepIndex, timer);
            
            const stopButton = document.createElement("button");
            stopButton.textContent = "Stop Timer";
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
            timerElement.textContent = formatTime(step.time);
        }, 1000);
    }
}

function stopTimer(taskIndex, stepIndex) {
    const step = tasks[taskIndex].steps[stepIndex];
    if (step.timer) {
        clearInterval(step.timer);
        step.timer = null;
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
    updateSummary();
}

function markStepDone(taskIndex, stepIndex) {
    tasks[taskIndex].steps[stepIndex].done = true;
    renderTasks();
    updateSummary();
}

function selectRandomTask() {
    if (tasks.length > 0) {
        const randomIndex = Math.floor(Math.random() * tasks.length);
        const randomTask = tasks[randomIndex];
        document.getElementById("random-task-display").textContent = `Selected Task: ${randomTask.name}`;
    } else {
        alert("No tasks available.");
    }
}

function saveTasks() {
    if (currentUser) {
        localStorage.setItem(currentUser, JSON.stringify(tasks));
        alert("Tasks saved successfully.");
    }
}

function loadTasks() {
    if (currentUser) {
        const savedTasks = localStorage.getItem(currentUser);
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
    }
}

function updateSummary() {
    const summary = document.getElementById("summary");
    summary.textContent = `Total Tasks: ${tasks.length}, Completed Tasks: ${completedTasks.length}`;
    updatePopupTable();
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
            const durationCell = document.createElement("td");
            durationCell.textContent = formatTime(step.time);

            row.appendChild(taskCell);
            row.appendChild(stepCell);
            row.appendChild(durationCell);

            dataTableBody.appendChild(row);
        });
    });
}

function showData() {
    updateSummary();
    const popup = document.getElementById("popup-table");
    popup.style.display = "flex";
}

function hideData() {
    const popup = document.getElementById("popup-table");
    popup.style.display = "none";
}
