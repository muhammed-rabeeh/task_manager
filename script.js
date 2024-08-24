<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Productivity Task Manager</title>
    <link rel="manifest" href="/manifest.json">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="signin-container" class="signin-container">
        <h2>Sign In</h2>
        <input type="text" id="username" placeholder="Enter your username">
        <button onclick="signIn()">Sign In</button>
    </div>

    <div id="task-container" class="container" style="display: none;">
        <div class="time-display">
            <p id="current-time"></p>
            <div class="time-box" id="time-left-box"></div>
            <div class="time-box" id="time-utilized-box"></div>
        </div>

        <h1>Productivity Task Manager</h1>

        <div class="input-container">
            <input type="text" id="task-input" placeholder="Enter a main task...">
            <button onclick="addTask()">Add Task</button>
        </div>

        <ul id="task-list"></ul>

        <div id="random-task-display" class="random-task-display"></div>

        <button id="random-button" onclick="selectRandomTask()">Select Random Task</button>

        <button id="save-button" onclick="saveTasks()">Save Tasks</button>
        <button id="data-button" onclick="showData()">Show Task Data</button>
        
    </div>

    <div id="popup-table" class="popup">
        <div class="popup-content">
            <span class="close" onclick="hideData()">&times;</span>
            <h2>Task Completion Data</h2>
            <p id="summary"></p>
            <table>
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Step</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody id="data-table-body"></tbody>
            </table>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
