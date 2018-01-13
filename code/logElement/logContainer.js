let filter = "NOFILTER";

/**
 * Prints the given message to the log
 */
function printMessages(message) {
   var curr = document.getElementById("displayed");
   var hide = "";

   if(message.type != filter && filter != "NOFILTER") {
      hide = " style='display:none;'";
   }

   curr.innerHTML = "<span class='" + message.type + "'" + hide + ">" + time(message.time) + "   " + message.content + "</span>" + curr.innerHTML;
}

/**
 * Returns a string representation of the time.
 * If the argument is undefined, the current time is returned.
 */
function time(s) {
   if(s == undefined) {
      return new Date().toLocaleTimeString('en-US', { hour12: false });
   } else {
      return new Date(s * 1e3).toLocaleTimeString('en-US', { hour12: false });
   }
}


/**
 *  Filters the elements in the displayed element to show only the one selected
 */
function changeFilter(filterValue) {

   filter = filterValue;

   var logDiv = document.getElementById('displayed');
   var logElementCount = logDiv.childElementCount;
   var logElements = logDiv.children;


   for (var i = 0; i < logElementCount; i++) {
      if (logElements[i].className != filterValue && filterValue != "NOFILTER") {
         logElements[i].style.display = "none";
      } else {
         logElements[i].style.display = "block";
      }
   }

}
