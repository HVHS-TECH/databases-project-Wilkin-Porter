const LOGIN_INFORMATION = document.getElementById("loginInformation");
const LOGIN_BUTTON = document.getElementById("loginButton");
const LOGOUT_BUTTON = document.getElementById("logoutButton");
loginButtonDisplay('show');

function displayLoginInformation() {
    if (fb_userInformation == null) {
        console.error('An error occured during sign in.');
        LOGIN_INFORMATION.style.color = 'red';
		LOGIN_INFORMATION.textContent = 'An error occured during sign in. Please try again later, or contact the site administrator if you believe this is a mistake.';
    } else {
        //console.log('Logged in as user: ' + fb_userInformation['displayName'] + '. Full user details:');
        //console.log(fb_userInformation);
        LOGIN_INFORMATION.style.color = '#145043';
        LOGIN_INFORMATION.textContent = 'Logged in as user: ' + fb_userInformation['displayName'];
    }
}

function removeLoginInformation() {
    console.log('User Logged Out');
    LOGIN_INFORMATION.innerHTML = 'Not Logged In';
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