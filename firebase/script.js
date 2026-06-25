let formInputName;
let formInputAge;

function initialiseIndex() {
    fb_authenticationListener();
    firebase.database().ref("/").child("vacuumingSimulator").orderByChild("comparisonTime").limitToFirst(3).once('value', displayVacuumingSimulatorTimeInformation, fb_error);
    firebase.database().ref("/geoDash").orderByChild("highScore").limitToLast(3).once('value', displayGeoDashHighscoreInformation, fb_error);
}

function displayLoginInformation(_formName, _googleProfileURL) {
    const LOGIN_INFORMATION = document.getElementById("loginInformation");
    const PROFILE_IMAGE = document.getElementById("profileImage");

    LOGIN_INFORMATION.style.color = 'black';
    LOGIN_INFORMATION.textContent = 'Logged in as ' + _formName;
    if (_googleProfileURL == undefined) {
        PROFILE_IMAGE.src = "../assets/unknownProfile.png";
    } else {
        PROFILE_IMAGE.src = _googleProfileURL;
    }
    
}

function removeLoginInformation() {
    const LOGIN_INFORMATION = document.getElementById("loginInformation");
    const PROFILE_IMAGE = document.getElementById("profileImage");

    LOGIN_INFORMATION.innerHTML = 'Not Logged In';
    PROFILE_IMAGE.src = "../assets/unknownProfile.png";
}

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

function returnButtonDisplay(_mode) {
    const RETURN_BUTTON = document.getElementById("returnButton");

    if (!RETURN_BUTTON) {
        console.error("RETURN_BUTTON Doesn't exist");
    } else if (_mode == "hide") {
        RETURN_BUTTON.hidden = true;
    } else if (_mode == "show") {
        RETURN_BUTTON.hidden = false;
    } else {
        console.error("returnButtonDisplay() is being called with something other than 'show' or 'hide'");
    }
}

function writeFormData(_firebaseUserInformation) {
    let nameExists = false;
    let ageExists = false;

    let localUserInformation = JSON.parse(sessionStorage.getItem('sessionUserInformation'));

    const LOGIN_ERROR = document.getElementById("loginError");

    if (_firebaseUserInformation.val() == null) {
        LOGIN_ERROR.textContent = "You are not logged in, cannot save info to database.";
        returnButtonDisplay('show');
        return;
    }

    if (('formName' in _firebaseUserInformation.val()) == true) {
        nameExists = true;
    }
    
    if (('formAge' in _firebaseUserInformation.val()) == true) {
        ageExists = true;
    } 

    if (nameExists == true && ageExists == true) {
        LOGIN_ERROR.textContent = "Your details have already been saved. They haven't been updated.";
        returnButtonDisplay('show');
        return;
    }

    if (nameExists == false) {
        fb_write("/userData/" + localUserInformation['uid'], "formName", formInputName, "update");
    } else {
        LOGIN_ERROR.style.color = "black";
        LOGIN_ERROR.textContent = "You already have a name saved, it hasn't been updated.";
    }
    
    if (ageExists == false) {
        fb_write("/userData/" + localUserInformation['uid'], "formAge", formInputAge, "update");
    } else {
        LOGIN_ERROR.style.color = "black";
        LOGIN_ERROR.textContent = "You already have an age saved, it hasn't been updated.";
    }

    LOGIN_ERROR.style.color = "black";
    LOGIN_ERROR.textContent = "Details Saved.";
    
    returnButtonDisplay('show');
}

function checkForm() {
    let localUserInformation = JSON.parse(sessionStorage.getItem('sessionUserInformation'));

    const FORM_INPUT_NAME = document.getElementById("name").value;
    const FORM_INPUT_AGE = document.getElementById("age").value;

    const NAME_ERROR = document.getElementById("nameError");
    const AGE_ERROR = document.getElementById("ageError");
    const LOGIN_ERROR = document.getElementById("loginError");

    if (localUserInformation == undefined || localUserInformation == null) {
        LOGIN_ERROR.textContent = "You are not logged in, cannot save info to database.";
        return;
    } else {
        LOGIN_ERROR.textContent = "";
    }

    if (FORM_INPUT_NAME == "") {
        NAME_ERROR.textContent = "Please Fill in This Field";
        return;
    } else if (FORM_INPUT_NAME.length > 40) {
        NAME_ERROR.textContent = "Please Input Text Shorter Than 40 Characters";
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

    if (FORM_INPUT_NAME == "") {
        NAME_ERROR.textContent = "Please Fill in This Field";
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

function displayVacuumingSimulatorTimeInformation(_timerObject) {
    if (_timerObject == null) {
        console.error("displayVacuumingSimulatorHighScoreInformation input parameter doesn't exist");
        return;
    }

    let timerArray = [];

    _timerObject.forEach(function(_timerValue) {
        timerArray.push(_timerValue.val())
    });

    //timerArray.reverse(); // Comment out for low - high Scores, add line for high - low scores

    for (let i = 1; i <= 3; i++) {
        if (document.getElementById("vacuumingSimulator" + i) == null) {
            console.error("HTML element vacuumingSimulator" + i + " doesn't exist");
            return;
        }
            
        if (timerArray[i - 1] != undefined) {
            if (timerArray[i - 1].comparisonTime == null || timerArray[i - 1].displayTime == null || timerArray[i - 1].formName == null ) {
                console.error("Either formName, comparisonTime or displayTime doesn't exist for position " + i + " in Vacuuming Simulator array");
                return;
            }
            document.getElementById("vacuumingSimulator" + i).textContent = timerArray[i - 1].displayTime + " By " + timerArray[i - 1].formName;
        }         
    }
}

function displayGeoDashHighscoreInformation(_highScoreObject) {
    if (_highScoreObject == null) {
        console.error("displayGeoDashHighscoreInformation input parameter doesn't exist");
        return;
    }
    
    let highScoreArray = [];

    _highScoreObject.forEach(function(_highScoreValue) {
        highScoreArray.push(_highScoreValue.val())
    });

    highScoreArray.reverse(); // Comment out for low - high Scores, add line for high - low scores

    for (let i = 1; i <= 3; i++) {
        if (document.getElementById("geoDash" + i) == null) {
            console.error("HTML element geoDash" + i + " doesn't exist");
            return;
        }

        if (highScoreArray[i - 1] != undefined) {
            if (highScoreArray[i - 1].highScore == undefined || highScoreArray[i - 1].formName == undefined) {
                console.error("Either formName or highScore doesn't exist for position " + i + " in geoDash array");
                return;
            }
            document.getElementById("geoDash" + i).textContent = highScoreArray[i - 1].highScore + " By " + highScoreArray[i - 1].formName;
        }         
    }
}