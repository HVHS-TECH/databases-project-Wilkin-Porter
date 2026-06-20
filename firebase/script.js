let formInputName;
let formInputAge;

function displayLoginInformation(_formName, _googleProfileURL) {
    const LOGIN_INFORMATION = document.getElementById("loginInformation");
    const PROFILE_IMAGE = document.getElementById("profileImage");

    LOGIN_INFORMATION.style.color = 'black';
    LOGIN_INFORMATION.textContent = 'Logged in as ' + _formName;
    PROFILE_IMAGE.src = _googleProfileURL;
    PROFILE_IMAGE.hidden = false;
}

function removeLoginInformation() {
    const LOGIN_INFORMATION = document.getElementById("loginInformation");
    const PROFILE_IMAGE = document.getElementById("profileImage");

    LOGIN_INFORMATION.innerHTML = 'Not Logged In';
    PROFILE_IMAGE.hidden = true;
}

function loginButtonDisplay(mode) {
    // Initialise elements
    const LOGIN_BUTTON = document.getElementById("loginButton");
    const LOGOUT_BUTTON = document.getElementById("logoutButton");
    
    if (!LOGIN_BUTTON) {
        console.error("LOGIN_BUTTON Doesn't exist");
        return;
    }

    if (!LOGOUT_BUTTON) {
        console.error("LOGOUT_BUTTON Doesn't exist");
        return;
    }

    if (mode == 'hide') {
        LOGIN_BUTTON.hidden = true;
        LOGOUT_BUTTON.hidden = false;
        return;
    } 

    if (mode == 'show') {
        LOGIN_BUTTON.hidden = false;
        LOGOUT_BUTTON.hidden = true;
        return;
    }

    console.error("loginButtonDisplay() is being called with something other than 'show' or 'hide'");
}

function writeFormData(_firebaseUserInformation) {
    let nameExists = false;
    let ageExists = false;

    let localUserInformation = JSON.parse(sessionStorage.getItem('sessionUserInformation'));

    const LOGIN_ERROR = document.getElementById("loginError");

    if (('formName' in _firebaseUserInformation.val()) == true) {
        nameExists = true;
    }
    
    if (('formAge' in _firebaseUserInformation.val()) == true) {
        ageExists = true;
    } 

    if (nameExists == true && ageExists == true) {
        LOGIN_ERROR.textContent = "Your details have already been saved. They haven't been updated.";
        return;
    }

    if (nameExists == false) {
        fb_write("/userdata/" + localUserInformation['uid'], "formName", formInputName, "update");
    } else {
        LOGIN_ERROR.style.color = "black";
        LOGIN_ERROR.textContent = "You already have a name saved, it hasn't been updated.";
    }
    
    if (ageExists == false) {
        fb_write("/userdata/" + localUserInformation['uid'], "formAge", formInputAge, "update");
    } else {
        LOGIN_ERROR.style.color = "black";
        LOGIN_ERROR.textContent = "You already have an age saved, it hasn't been updated.";
    }
    
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
        NAME_ERROR.textContent = "Please Fill in this field";
        return;
    } else if (FORM_INPUT_NAME.length > 40) {
        NAME_ERROR.textContent = "Please Input Text Shorter than 40 Characters";
        return;
    } else {
        NAME_ERROR.textContent = "";
    }

    if (FORM_INPUT_NAME == "") {
        NAME_ERROR.textContent = "Please Fill in this field";
        return;
    } else if (Number(FORM_INPUT_AGE) <= 0) {
        AGE_ERROR.textContent = "Please input a real age (Must be greater than 0)";
        return;
    } else if (Number(FORM_INPUT_AGE) < 13) {
        AGE_ERROR.textContent = "You must be at least 13 years of age to use this site";
        return;
    } else if (Number(FORM_INPUT_AGE) > 120) {
        AGE_ERROR.textContent = "Please input a real age (Must be less than 120)";
        return;
    } else {
        AGE_ERROR.textContent = "";
    }

    formInputName = FORM_INPUT_NAME;
    formInputAge = Number(FORM_INPUT_AGE);

    firebase.database().ref("/userdata").child(localUserInformation['uid']).once('value', writeFormData, fb_error);
}