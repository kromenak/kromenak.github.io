// https://stackoverflow.com/questions/56300132/how-to-override-css-prefers-color-scheme-setting
// Return the system level color scheme, but if something's in local storage, return that
// Unless the system scheme matches the the stored scheme, in which case... remove from local storage
function getPreferredColorScheme(){
  let systemScheme = 'light';
  if(window.matchMedia('(prefers-color-scheme: dark)').matches){
    systemScheme = 'dark';
  }
  let chosenScheme = systemScheme;

  if(localStorage.getItem("scheme")){
    chosenScheme = localStorage.getItem("scheme");
  }

  if(systemScheme === chosenScheme){
    localStorage.removeItem("scheme");
  }

  return chosenScheme;
}

// Write chosen color scheme to local storage
// Unless the system scheme matches the the stored scheme, in which case... remove from local storage
function savePreferredColorScheme(scheme){
  let systemScheme = 'light';

  if(window.matchMedia('(prefers-color-scheme: dark)').matches){
    systemScheme = 'dark';
  }

  if(systemScheme === scheme){
    localStorage.removeItem("scheme");
  }
  else {
    localStorage.setItem("scheme", scheme);
  }
}

// Get the current scheme, and apply the opposite.
function toggleColorScheme(){
  let newScheme = "light";
  let scheme = getPreferredColorScheme();
  if(scheme === "light"){
    newScheme = "dark";
  }

  applyPreferredColorScheme(newScheme);
  savePreferredColorScheme(newScheme);
}

// Apply the chosen color scheme by traversing stylesheet rules, and applying a medium.
function applyPreferredColorScheme(scheme) {

  // Iterate all stylesheets loaded for the document.
  for(var sheetIdx = 0; sheetIdx < document.styleSheets.length; sheetIdx++) {

    // The try/catch is necessary b/c external stylesheets don't allow accessing "rules" field.
    // In those cases, we should ignore and move on. We only care about our local stylesheets anyway.
    try {

      // Iterate all the rules in the stylesheet.
      for(var i = 0; i < document.styleSheets[sheetIdx].rules.length; i++) {
        rule = document.styleSheets[sheetIdx].rules[i].media;

        // If there's a color-scheme bit in the rule, we want to toggle it on/off.
        if(rule && rule.mediaText.includes("prefers-color-scheme")) {
          switch(scheme) {
            case "light":
              rule.appendMedium("original-prefers-color-scheme");
              if(rule.mediaText.includes("light")) rule.deleteMedium("(prefers-color-scheme: light)");
              if(rule.mediaText.includes("dark")) rule.deleteMedium("(prefers-color-scheme: dark)");
              break;
            case "dark":
              rule.appendMedium("(prefers-color-scheme: light)");
              rule.appendMedium("(prefers-color-scheme: dark)");
              if(rule.mediaText.includes("original")) rule.deleteMedium("original-prefers-color-scheme");
              break;
            default:
              rule.appendMedium("(prefers-color-scheme: dark)");
              if(rule.mediaText.includes("light")) rule.deleteMedium("(prefers-color-scheme: light)");
              if(rule.mediaText.includes("original")) rule.deleteMedium("original-prefers-color-scheme");
              break;
          }
        }
      }
    }
    catch(error) { }
  }

  // Change the toggle button to be the opposite of the current scheme
  var sunIcon = document.getElementById("icon-sun");
  var moonIcon = document.getElementById("icon-moon");
  if(scheme === "dark"){
    if(sunIcon) { sunIcon.style.display='inline'; }
    if(moonIcon) { moonIcon.style.display='none'; }
  }
  else {
    if(sunIcon) { sunIcon.style.display='none'; }
    if(moonIcon) { moonIcon.style.display='inline'; }
  }
}

// Run this script BEFORE the page loads to avoid delay in desired page color.
applyPreferredColorScheme(getPreferredColorScheme());

// Run this script AFTER the page loads to ensure the sun/moon icon is correct.
window.addEventListener("load", (event) => {
  applyPreferredColorScheme(getPreferredColorScheme());
});