/*
 * 	JavaScript file for LOGCONTAINER.HTML
 */

var logDocument;
var logFrame = document.getElementById('logFrame');
var logWindow = logFrame.contentWindow;

logWindow.addEventListener('load', function() {
	console.log("log.js loaded");
	logDocument = logFrame.contentDocument || logFrame.contentWindow.document;
});

/*var messages = [{type: "ERROR",
                        time: 65457,
                        content: "Mission start failure"
                        },

                       {type: "COMM",
                        time: 98765,
                        content: "Quad A requesting open channel"
                        },

                       {type: "SUCCESS",
                        time: 13425,
                        content: "Mission started successfully"},

                       {type: "UI",
                        time: 12428,
                        content: "This is the UI"}
                       ];

function printMessages(message) {
    var curr = document.getElementById("displayed");

    if (message.type == "ERROR") {
        curr.innerHTML = "<span style='color: red'>" + time(message.time) + "   " + message.content + "</span><br>" + curr.innerHTML;
    }
    else if (message.type == "SUCCESS") {
        curr.innerHTML = "<span style='color: green'>" + time(message.time) + "   " + message.content + "</span><br>" + curr.innerHTML;
    }
    else if (message.type == "UI") {
        curr.innerHTML = "<span style='color: purple'>" + time(message.time) + "   " + message.content + "</span><br>" + curr.innerHTML;
    }
    else {//(message.type == "COMM") {
        curr.innerHTML = time(message.time) + "   " + message.content + "<br>" + curr.innerHTML;
    }
}

function time(s) {
    return new Date(s * 1e3).toISOString().slice(-13, -5);
}*/