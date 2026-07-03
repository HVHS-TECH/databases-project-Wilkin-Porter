/*****************************************************************************************************/
// Firebase: script.js
// Firebase script used mainly for form checking, and user interface changes
// Written by Wilkin Porter - Term 2 2026
/*****************************************************************************************************/


/*****************************************************************************************************/
// Global Variables, Constants and Arrays
/*****************************************************************************************************/
const VACUUMING_SIMULATOR_HIGH_SCORE_LIST_LENGTH = 5;
const GEO_DASH_HIGH_SCORE_LIST_LENGTH = 5;

let formInputName;
let formInputAge;


/*****************************************************************************************************/
// initialiseIndex()
// Called by: index.html
// Calls: fb_authenticationListener(), displayVacuumingSimulatorTimeInformation(), and 
// displayGeoDashHighscoreInformation()
// Calls fb_authenticationListener() to attempt to sign in the user, then creates the listeners that
// detect changes in the game directories (for high score updates), then calls the display functions
// and passes the top (XXX_HIGH_SCORE_LIST_LENGTH) player scores, in decending order.
/*****************************************************************************************************/
function initialiseIndex() {
    fb_authenticationListener();
    firebase.database()
        .ref("/vacuumingSimulator")
        .orderByChild("comparisonTime")
        .limitToFirst(VACUUMING_SIMULATOR_HIGH_SCORE_LIST_LENGTH)
        .on('value', displayVacuumingSimulatorTimeInformation, fb_error);
    firebase.database()
        .ref("/geoDash")
        .orderByChild("highScore")
        .limitToLast(GEO_DASH_HIGH_SCORE_LIST_LENGTH)
        .on('value', displayGeoDashHighscoreInformation, fb_error);
}


/*****************************************************************************************************/
// displayLoginInformation()
// _formName: The user's preferred name to display
// _googleProfileURL: The user's profile URL used to display their profile picture
// Called by: fb_writeGoogleInformation()
// Checks if HTML elements exist, if they do it sets HTML element attributes to display the user's 
// preferred name and profile picture, if the profile picture URL doesn't exist it sets it to the 
// unknown profile icon, if the preferred name doesn't exist, well, thats not really possible.
/*****************************************************************************************************/
function displayLoginInformation(_formName, _googleProfileURL) {
    const LOGIN_INFORMATION = document.getElementById("loginInformation");
    const PROFILE_IMAGE = document.getElementById("profileImage");

    if (!LOGIN_INFORMATION) {
        console.error("LOGIN_INFORMATION Doesn't exist");
        return;
    } else if (!PROFILE_IMAGE) {
        console.error("PROFILE_IMAGE Doesn't exist"); 
        return;
    }

    if (!_formName) {
        LOGIN_INFORMATION.textContent = 'Google puts easter eggs in, so I can too. Congrats!';
    } else {
        LOGIN_INFORMATION.textContent = 'Logged in as ' + _formName;
    }
    
    if (!_googleProfileURL) {
        PROFILE_IMAGE.src = "../assets/unknownProfile.png";
    } else {
        PROFILE_IMAGE.src = _googleProfileURL;
    }
    
}


/*****************************************************************************************************/
// removeLoginInformation()
// Called by: fb_logout()
// Checks if HTML elements exist, if they do it sets HTML element attributes to display the standard 
// non logged in text, and sets the profile picture to unknown.
/*****************************************************************************************************/
function removeLoginInformation() {
    const LOGIN_INFORMATION = document.getElementById("loginInformation");
    const PROFILE_IMAGE = document.getElementById("profileImage");

    if (!LOGIN_INFORMATION) {
        console.error("LOGIN_INFORMATION Doesn't exist");
    } else if (!PROFILE_IMAGE) {
        console.error("PROFILE_IMAGE Doesn't exist"); 
    }

    LOGIN_INFORMATION.innerHTML = 'Not Logged In';
    PROFILE_IMAGE.src = "../assets/unknownProfile.png";
}


/*****************************************************************************************************/
// loginButtonDisplay()
// _mode: should be either "hide" or "show", used for changing what to show/hide
// Called by: fb_authenticationListener(), fb_checkLoginState(), fb_writeGoogleInformation(), and 
// fb_logout()
// Checks if HTML elements exist, if they do it sets HTML element attributes to either show the logout
// button and hide the login (_mode == "hide") or show the login button and hide the logout button 
// (_mode == "show"). If mode is not "hide" or "show" it returns an error
/*****************************************************************************************************/
function loginButtonDisplay(_mode) {
    const LOGIN_BUTTON = document.getElementById("loginButton");
    const LOGOUT_BUTTON = document.getElementById("logoutButton");
    
    if (!LOGIN_BUTTON) {
        console.error("LOGIN_BUTTON Doesn't exist");
    } else if (!LOGOUT_BUTTON) {
        console.error("LOGOUT_BUTTON Doesn't exist");
    } else if (_mode == 'hide') {
        LOGIN_BUTTON.hidden = true;
        LOGOUT_BUTTON.hidden = false;
    } else if (_mode == 'show') {
        LOGIN_BUTTON.hidden = false;
        LOGOUT_BUTTON.hidden = true;
    } else {
        console.error("loginButtonDisplay() is being called with something other than 'show' or 'hide'");
    }
}


/*****************************************************************************************************/
// returnButtonDisplay()
// _mode: should be either "hide" or "show", used for changing what to show/hide
// Called by: writeFormData()
// Checks if HTML elements exist, if they do it sets HTML element attributes to either show the submit
// button and hide the return (_mode == "hide") or show the return button and hide the submit button 
// (_mode == "show"). If mode is not "hide" or "show" it returns an error
/*****************************************************************************************************/
function returnButtonDisplay(_mode) {
    const RETURN_BUTTON = document.getElementById("returnButton");
    const SUBMIT_BUTTON = document.getElementById("submitButton");

    if (!RETURN_BUTTON || !SUBMIT_BUTTON) {
        console.error("RETURN_BUTTON or SUBMIT_BUTTON Don't exist");
    } else if (_mode == "hide") {
        RETURN_BUTTON.hidden = true;
        SUBMIT_BUTTON.hidden = false;
    } else if (_mode == "show") {
        RETURN_BUTTON.hidden = false;
        SUBMIT_BUTTON.hidden = true;
    } else {
        console.error("returnButtonDisplay() is being called with something other than 'show' or 'hide'");
    }
}


/*****************************************************************************************************/
// checkForm()
// Called by: details.html
// Calls: writeFormData()
// Tries to get user details from session storage and checks if it exists, if not, displays not logged 
// in error. Checks form data and displays errors in the following situations:
// If name is empty, name is longer than 40 characters, name contains any of the following: <, >, $, ., #,
// /, [, ]
// If age is empty, age is less than 0, age is less than 13, age is greater than 120.
// If the form passes these checks the form data is saved in variables for use in writeFormData(), and
// it creates a database read operation with a callback to writeFormData().
/*****************************************************************************************************/
function checkForm() {
    let localUserInformation = JSON.parse(sessionStorage.getItem('sessionUserInformation'));

    const FORM_INPUT_NAME = document.getElementById("name").value;
    const FORM_INPUT_AGE = document.getElementById("age").value;

    const NAME_ERROR = document.getElementById("nameError");
    const AGE_ERROR = document.getElementById("ageError");
    const LOGIN_ERROR = document.getElementById("loginError");

    if (localUserInformation == undefined || localUserInformation == null) {
        LOGIN_ERROR.textContent = "You are not logged in, cannot save info to database.";
        returnButtonDisplay('show');
        return;
    } else {
        LOGIN_ERROR.textContent = "";
    }

    if (FORM_INPUT_NAME == "") {
        NAME_ERROR.textContent = "Please Fill in This Field";
        return;
    } else if (FORM_INPUT_NAME.length > 24) {
        NAME_ERROR.textContent = "Maximum Name Length is 24 Characters";
        return;
    } else if (FORM_INPUT_NAME.length < 3) {
        NAME_ERROR.textContent = "Minimum Name Length is 3 Characters";
        return;
    } else if (
        FORM_INPUT_NAME.includes("<") || 
        FORM_INPUT_NAME.includes(">") ||
        FORM_INPUT_NAME.includes("$") ||
        FORM_INPUT_NAME.includes(".") ||
        FORM_INPUT_NAME.includes("#") ||
        FORM_INPUT_NAME.includes("/") ||
        FORM_INPUT_NAME.includes("[") ||
        FORM_INPUT_NAME.includes("]")
    ) {
        NAME_ERROR.textContent = "Certain Special Characters You Have Typed Are Not Supported, Please Remove Them";
        return;
    } else {
        NAME_ERROR.textContent = "";
    }

    if (FORM_INPUT_AGE == "") {
        AGE_ERROR.textContent = "Please Fill in This Field";
        return;
    } else if (Number(FORM_INPUT_AGE) <= 0) {
        AGE_ERROR.textContent = "Please Input a Real Age (Must be greater than 0)";
        return;
    } else if (Number(FORM_INPUT_AGE) < 13) {
        AGE_ERROR.textContent = "You Must be at Least 13 Years of Age to Use This Site";
        return;
    } else if (Number(FORM_INPUT_AGE) > 120) {
        AGE_ERROR.textContent = "Please Input a Real Age (Must be Less Than 120)";
        return;
    } else {
        AGE_ERROR.textContent = "";
    }

    formInputName = FORM_INPUT_NAME;
    formInputAge = Number(FORM_INPUT_AGE);

    firebase.database().ref("/userData").child(localUserInformation['uid']).once('value', writeFormData, fb_error);
}


/*****************************************************************************************************/
// writeFormData()
// _firebaseUserInformation: data read from location /userData/uid
// Called by: checkForm()
// Calls: returnButtonDisplay()
// Just like Check form this function tries to get user details from session storage and checks if it 
// exists, if not, displays not logged in error. Checks to see if _firebaseUserInformation contains 
// either "formName" or "formAge", if it does it sets the corrosponding variable to true. (It's best to
// read the flow chart below to understand the rest of the function)
/*****************************************************************************************************/
function writeFormData(_firebaseUserInformation) {
    let nameExists = false;
    let ageExists = false;

    let localUserInformation = JSON.parse(sessionStorage.getItem('sessionUserInformation'));

    const LOGIN_ERROR = document.getElementById("loginError");

    if (_firebaseUserInformation.val() == null) {
        LOGIN_ERROR.textContent = "You are not logged in, cannot save info to database.";
        returnButtonDisplay('show');
        return;
    } else {
        LOGIN_ERROR.textContent = "";
    }

    if (('formName' in _firebaseUserInformation.val()) == true) {
        nameExists = true;
    }
    
    if (('formAge' in _firebaseUserInformation.val()) == true) {
        ageExists = true;
    } 

    // It's best to explain this block with a flow chart typa thing I reckon, here goes: (Write means a write to firebase)
    //      Yes --> Age exists          --> Details already saved, do nothing (checking for URL hacking basically)
    //      |   --> Age doesn't exist   --> Write age only, display that name already exists
    // Name exists
    //      |   --> Age exists          --> Write name only, display that age already exists
    //      No  --> Age doesn't exist   --> Write both and display successful write (normal operation)
    // (Now with error checking!)
    if (nameExists == true) {
        if (ageExists == true) {
            LOGIN_ERROR.textContent = "Your details have already been saved. They haven't been updated.";
            returnButtonDisplay('show');
        } else if (ageExists == false) {
            LOGIN_ERROR.style.color = "black";
            LOGIN_ERROR.textContent = "Age saved. You already have a name saved, it hasn't been updated.";
            firebase.database().ref("/userData/" + localUserInformation['uid']).update({formAge: formInputAge});
            returnButtonDisplay('show');
        } else {
            console.error("ageExists is not true or false");
        }
    } else if (nameExists == false) {
        if (ageExists == true) {
            LOGIN_ERROR.style.color = "black";
            LOGIN_ERROR.textContent = "Name saved. You already have an age saved, it hasn't been updated.";
            firebase.database().ref("/userData/" + localUserInformation['uid']).update({formName: formInputName});
            returnButtonDisplay('show');
        } else if (ageExists == false) {
            LOGIN_ERROR.style.color = "black";
            LOGIN_ERROR.textContent = "Details Saved.";
            firebase.database().ref("/userData/" + localUserInformation['uid']).update({formName: formInputName, formAge: formInputAge});
            returnButtonDisplay('show');
        } else {
            console.error("ageExists is not true or false");
        }
    } else {
        console.error("nameExists is not true or false");
    }
}


/*****************************************************************************************************/
// displayVacuumingSimulatorTimeInformation()
// _timerObject: data read from location /vacuumingSimulator (ordered by comparisonTime)
// Called by: initialiseIndex()
// Checks if _timerObject exists, if it does it continues the function if it doesn't it logs an error. 
// The function continues by creating an empty array and for each of the pieces of the sorted objects 
// in _timerObject it adds them to the array, which preserves their order. The for loop then checks if 
// the HTML element exists, and if it does it checks if the object for position i - 1 in the array 
// exists, and if it does it checks the key:value pairs to make sure they all exist, finally if 
// everything is correct it displays the information in the corresponding spot
/*****************************************************************************************************/
function displayVacuumingSimulatorTimeInformation(_timerObject) {
    if (!_timerObject) {
        console.error("displayVacuumingSimulatorHighScoreInformation input parameter doesn't exist");
        return;
    }

    // Creates an empty array
    let timerArray = [];

    // Adds each individual snapshot of data to the array in the form of an object (this preserves firebase ordering)
    _timerObject.forEach(function(_timerValue) {
        timerArray.push(_timerValue.val())
    });

    //timerArray.reverse(); // Comment out for low --> high Scores, add line for high --> low scores

    for (let i = 1; i <= VACUUMING_SIMULATOR_HIGH_SCORE_LIST_LENGTH ; i++) {
        // Checking if HTML element exists
        if (document.getElementById("vacuumingSimulator" + i) == null) {
            console.error("HTML element vacuumingSimulator" + i + " doesn't exist");
            return;
        }
        
        // Checking if object exists at position i - 1 in array
        if (timerArray[i - 1]) {
            // Checking if required object keys and values exist
            if (timerArray[i - 1].comparisonTime == null || timerArray[i - 1].displayTime == null || timerArray[i - 1].formName == null ) {
                console.error("Either formName, comparisonTime or displayTime doesn't exist for position " + i + " in Vacuuming Simulator array");
                return;
            }

            // Finally displaying the data
            document.getElementById("vacuumingSimulator" + i).textContent = timerArray[i - 1].displayTime + " By " + timerArray[i - 1].formName;
        }         
    }
}


/*****************************************************************************************************/
// displayGeoDashHighscoreInformation()
// _highScoreObject: data read from location /geoDash (ordered by highScore)
// Called by: initialiseIndex()
// Checks if _highScoreObject exists, if it does it continues the function if it doesn't it logs an error. 
// The function continues by creating an empty array and for each of the pieces of the sorted objects 
// in _highScoreObject it adds them to the array, which preserves their order. The for loop then checks if 
// the HTML element exists, and if it does it checks if the object for position i - 1 in the array 
// exists, and if it does it checks the key:value pairs to make sure they all exist, finally if 
// everything is correct it displays the information in the corresponding spot
/*****************************************************************************************************/
function displayGeoDashHighscoreInformation(_highScoreObject) {
    if (_highScoreObject == null) {
        console.error("displayGeoDashHighscoreInformation input parameter doesn't exist");
        return;
    }
    
    // Creates an empty array
    let highScoreArray = [];

    // Adds each individual snapshot of data to the array in the form of an object (this preserves firebase ordering)
    _highScoreObject.forEach(function(_highScoreValue) {
        highScoreArray.push(_highScoreValue.val())
    });

    highScoreArray.reverse(); // Comment out for low --> high Scores, add line for high --> low scores

    for (let i = 1; i <= GEO_DASH_HIGH_SCORE_LIST_LENGTH; i++) {
        // Checking if HTML element exists
        if (document.getElementById("geoDash" + i) == null) {
            console.error("HTML element geoDash" + i + " doesn't exist");
            return;
        }

        // Checking if object exists at position i - 1 in array
        if (highScoreArray[i - 1]) {
            // Checking if required object keys and values exist
            if (highScoreArray[i - 1].highScore == undefined || highScoreArray[i - 1].formName == undefined) {
                console.error("Either formName or highScore doesn't exist for position " + i + " in geoDash array");
                return;
            }

            // Finally displaying the data
            document.getElementById("geoDash" + i).textContent = highScoreArray[i - 1].highScore + " By " + highScoreArray[i - 1].formName;
        }         
    }
}