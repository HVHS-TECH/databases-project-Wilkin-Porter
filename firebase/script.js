const LOGIN_INFORMATION = document.getElementById("loginInformation");
const LOGIN_BUTTON = document.getElementById("loginButton");
const LOGOUT_BUTTON = document.getElementById("logoutButton");
const PROFILE_IMAGE = document.getElementById("profileImage");
loginButtonDisplay('show');

function displayLoginInformation(_formName, _googleProfileURL) {
    if (globalUserInformation == null) {
        console.error('An error occured during sign in.');
        LOGIN_INFORMATION.style.color = 'red';
		LOGIN_INFORMATION.textContent = 'An error occured during sign in. Please try again later, or contact the site administrator if you believe this is a mistake.';
    } else {
        //console.log('Logged in as user: ' + globalUserInformation['displayName'] + '. Full user details:');
        //console.log(globalUserInformation);
        LOGIN_INFORMATION.style.color = 'black';
        LOGIN_INFORMATION.textContent = 'Logged in as user: ' + _formName;
        PROFILE_IMAGE.src = _googleProfileURL;
        PROFILE_IMAGE.hidden = false;
    }
}

function removeLoginInformation() {
    console.log('User Logged Out');
    LOGIN_INFORMATION.innerHTML = 'Not Logged In';
    PROFILE_IMAGE.hidden = true;
}

function loginButtonDisplay(mode) {
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