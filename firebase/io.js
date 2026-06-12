let logout;
let fb_userInformation;
let authenticationListener;

function fb_authenticate() {
    logout = false;
    authenticationListener = firebase.auth().onAuthStateChanged(fb_checkLoginState)
}

function fb_checkLoginState(_userInformation) {
    if (logout == true) {
        return;
    }
    if (_userInformation) {
        firebase.database().ref('userdata').update({
            [_userInformation['uid']]: {
                userName: _userInformation['displayName'],
                email: _userInformation['email'],
                profileURL: _userInformation['photoURL']
            }
        });
        fb_userInformation = _userInformation;
        displayLoginInformation();
        loginButtonDisplay('hide');
    } else {
        fb_loginPopup();
    }
}

function fb_loginPopup() {
	let provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider);
}

function fb_logout() {
    logout = true;
    loginButtonDisplay('show');
    firebase.auth().signOut();
    removeLoginInformation();
}

function fb_error(){
    // Don't forget your error handling!
}