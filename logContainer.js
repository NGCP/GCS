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
}