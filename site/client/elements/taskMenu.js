var menuTemplate = "<a-entity class='taskMenu' position='0 1.5 -3'>" +
            "<!-- Background -->" +
            "<a-plane material='color: white; opacity: 0.3' scale='1.5 1 1'></a-plane>" +
            
            "<!-- Title -->" +
            "<a-entity class='menuTitle' position='-1.3 0.7 0' text='text: %MENUTITLE%' scale='0.3 0.3 0.3' material='color: black'></a-entity>" +
            
            "<a-entity position='0 0 0.01'>" +
                
                "<!-- Tasks -->" +
                "<a-entity class='taskTitlesContainer' position='-0.65 0.4 0'>" +
                    "%TASKTITLESHTML%" +
                "</a-entity>" +
                
                "<!-- Task Description -->" +
                "<a-entity position='0.65 0.25 0'>" +
                    "<!-- Background -->" +
                    "<a-plane material='color: white; opacity: 0.5' scale='0.65 0.7 0' position='0 -0.45 0'></a-plane>" +
                    
                    "<!-- Text -->" +
                    "<a-entity class='taskDescriptionsContainer'>" +
                        "%TASKDESCRIPTIONSHTML%" +
                    "</a-entity>" +
                "</a-entity>" +
            "</a-entity>" +
            
        "</a-entity>";
        
var taskTitleTemplate = "<a-entity class='%CLASSNAME%' position='0 %OFFSET% 0' class='task1'>" +
            "<!-- Background -->" +
            "<a-plane class='background' material='color: white; opacity: 0.1' scale='0.65 0.1 0'></a-plane>" +
            
            "<!-- Title -->" +
            "<a-entity class='title' position='-0.33 -0.02 0' text='text: %TEXT%' scale='0.1 0.1 0.1' material='color: black'></a-entity>" +
        "</a-entity>";
        
var taskDescriptionTemplate = "<a-entity class='%CLASSNAME%' position='-0.5 0.13 0' visible='false'>%TEXTHTML%</a-entity>";

var lineOfTextTemplate = "<a-entity position='0 %OFFSET% 0' text='text: %TEXT%' scale='0.1 0.1 0.1' material='color: black'></a-entity>";

TasksMenu = function (selector, opts) {
    var currentTask = 0;
    
    this.getCurrentTask = function () {
        return currentTask;
    }
    
    this.next = function () {
        moveToTask(currentTask + 1)
    }
    
    var moveToTask = function (taskToMoveTo) {
        if(taskToMoveTo < 0 || taskToMoveTo >= opts.tasks.length)
            return;
        
        if(taskToMoveTo != currentTask) {
            var previousTask = currentTask;
            completeTask(previousTask)
        }

        beginTask(taskToMoveTo);
    }
    
    var completeTask = function (task) {
        if(opts.tasks[task].taskComplete)
            opts.tasks[task].taskComplete();
            
        if(opts.taskComplete)
            opts.taskComplete();
            
        $(selector + " .taskTitle" + task + " .background").get(0).setAttribute("material", "opacity", "0.1");
        $(selector + " .taskTitle" + task + " .background").get(0).setAttribute("material", "color", "green");
        $(selector + " .taskDescription" + task).get(0).setAttribute("visible", "false");
    }
    
    var beginTask = function (task) {
        currentTask = task;
        
        if(opts.tasks[currentTask].taskBegin)
                opts.tasks[currentTask].taskBegin();
                
        if(opts.taskBegin)
            opts.taskBegin();
                
        $(selector + " .taskTitle" + currentTask + " .background").get(0).setAttribute("material", "opacity", "0.5");
        $(selector + " .taskDescription" + currentTask).get(0).setAttribute("visible", "true");
    }

    this.init = function () {
        var menuHtml = menuTemplate.replace("%MENUTITLE%", opts.title);
        
        // Loop over each task and create visuals for its title and description
        var taskTitlesHtml = "";
        var taskDescriptionsHtml = "";
        for(var taskIndex = 0; taskIndex < opts.tasks.length; taskIndex++) {
            var task = opts.tasks[taskIndex];
            
            // Create visual for task title
            taskTitlesHtml += taskTitleTemplate.replace("%CLASSNAME%", "taskTitle" + taskIndex).replace("%OFFSET%", taskIndex * -0.2).replace("%TEXT%", task.title);
            
            // Create lines for the description
            var maxCharactersPerLine = 35;
            var wordsInDescription = task.description.split(' ');
            var lines = [];
            var line = "";
            for(var wordIndex = 0; wordIndex < wordsInDescription.length; wordIndex++) {
                var word = wordsInDescription[wordIndex];
                if(line.length + word.length < maxCharactersPerLine)
                    line += " " + word;
                else {
                    lines.push(line);
                    line = "" + word;
                }
            }
            
            // Push the last line
            if(line.length > 0)
                lines.push(line);
            
            // Create the visuals for each line
            var textHtml = "";
            for(var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                var line = lines[lineIndex];
                textHtml += lineOfTextTemplate.replace("%OFFSET%", lineIndex * -0.15).replace("%TEXT%", line)
            }
            
            // Create visual for the entire description
            taskDescriptionsHtml += taskDescriptionTemplate.replace("%CLASSNAME%", "taskDescription" + taskIndex).replace("%TEXTHTML%", textHtml);
        }
        
        menuHtml = menuHtml.replace("%TASKTITLESHTML%", taskTitlesHtml).replace("%TASKDESCRIPTIONSHTML%", taskDescriptionsHtml);
        this.rootEl = $(menuHtml).get(0);
        $("a-scene").append(this.rootEl);
    }
    
    this.init();
    moveToTask(0);
}