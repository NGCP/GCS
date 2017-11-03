// Dump all text messages (ex: communication messages, errors, etc...)
// Messages should be allowed color coding
// "error" -> red
// "comm" -> black
// "success" -> green
// "ui" -> purple

function printMessages(message) {
    var curr = document.getElementById("messages");

    if (message.type == "ERROR") {
        curr.innerHTML = "<span style='color:red'>" + message.content + "</span><br>" + curr.innerHTML;
    }
    else if (message.type == "COMM") {
        curr.innerHTML = message.content + "<br>" + curr.innerHTML;
    }
    else if (message.type == "SUCCESS") {
        curr.innerHTML = "<span style='color:green'>" + message.content + "</span><br>" + curr.innerHTML;
    }
    else if (message.type == "UI") {
        curr.innerHTML = "<span style='color:purple'>" + message.content + "</span><br>" + curr.innerHTML;
    }
}

// if printing to the console is preferred
function consoleMessages() {

    var messages = [{type: "ERROR",
                     content: "Mission start failure"},
                    {type: "COMM",
                     content: "Quad A requesting open channel"},
                    {type: "SUCCESS",
                     content: "Mission started successfully"},
                    {type: "UI",
                     content: "This is the UI"}
                    ];

    messages.forEach(function(message) {
        if (message.type == "ERROR") {
            console.log("%c" + message.content, "color: red");
        }
        else if (message.type == "COMM") {
            console.log(message.content);
        }
        else if (message.type == "SUCCESS") {
            console.log("%c" + message.content, "color: green");
        }
        else if (message.type == "UI") {
            console.log("%c" + message.content, "color: purple");
        }
    });
}