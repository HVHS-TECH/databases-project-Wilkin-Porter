let logout;
let globalUserInformation;
let authenticationListener;

function fb_authenticationListener() {
    loginButtonDisplay('show');
    authenticationListener = firebase.auth().onAuthStateChanged(fb_checkLoginState);
}

function fb_login() {
    logout = false;
    fb_loginPopup();
}

function fb_checkLoginState(_localUserInformation) {
    if (logout == true) {
        return;
    }
    if (_localUserInformation) {
        globalUserInformation = _localUserInformation;
        sessionStorage.setItem('sessionUserInformation', JSON.stringify(_localUserInformation));
        firebase.database().ref('/userData').child(_localUserInformation['uid']).once('value', fb_writeGoogleInformation, fb_error);
    } else {
        loginButtonDisplay('show');
    }
}

function fb_writeGoogleInformation(_firebaseUserInformation) {
    firebase.database().ref('userData/' + globalUserInformation['uid']).update({
        googleName: globalUserInformation['displayName'],
        googleEmail: globalUserInformation['email'],
        googleProfileURL: globalUserInformation['photoURL']
    });

    if (_firebaseUserInformation.val() == null) {
        // No UID exists for user so neither can form details, so redirect to details page
        window.location.href = "details.html";
    } else if (('formName' in _firebaseUserInformation.val()) == false || ('formAge' in _firebaseUserInformation.val()) == false) {
        // Either form age, form name or both don't exist, so redirect to details page
        window.location.href = "details.html";
    } else {
        // Both form age and form name exist, so log user in.
        displayLoginInformation(_firebaseUserInformation.val()['formName'], _firebaseUserInformation.val()['googleProfileURL']);
        loginButtonDisplay('hide');
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
    console.error("An error occured while trying to access Firebase.\nThis could be because you don't have permission to access the location, or the location is incorrect.");
}

// General Write:
function fb_write(_location, _key, _data, _mode) {
    if (_mode == "set") {
        firebase.database().ref(_location).set({[_key]: _data});
    } else if (_mode == "update") {
        firebase.database().ref(_location).update({[_key]: _data});
    } else {
        console.error("fb_write is is being called with something other than 'set' or 'update'");
    }
}

async function fb_writeGeoDash(_score) {
    let localUserInformation = JSON.parse(sessionStorage.getItem("sessionUserInformation")); // could change to const
    
    if (localUserInformation == null) {
        console.log("User not logged in, not saving their score"); // remove for final idk
        return;
    }

    const GEODASH_HIGH_SCORE_DATA = await firebase.database().ref("/geoDash/" + localUserInformation["uid"]).once('value');

    if (GEODASH_HIGH_SCORE_DATA.val() == null) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/geoDash/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            highScore: _score
        });
        
        return;
    }

    if (_score > GEODASH_HIGH_SCORE_DATA.val()["highScore"]) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/geoDash/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            highScore: _score
        });
        
        console.log("Updated this user's high score, it is now " + score); // remove for final idk
    } else {
        console.log("Didn't update this user's high score");
    }
}

async function fb_writeVacuumingSimulator(_score) {
    let localUserInformation = JSON.parse(sessionStorage.getItem("sessionUserInformation")); // could change to const
    
    if (localUserInformation == null) {
        console.log("User not logged in, not saving their score"); // remove for final idk
        return;
    }

    const VACUUMING_SIMULATOR_HIGH_SCORE_DATA = await firebase.database().ref("/vacuumingSimulator/" + localUserInformation["uid"]).once('value');

    if (VACUUMING_SIMULATOR_HIGH_SCORE_DATA.val() == null) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/vacuumingSimulator/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            highScore: _score
        });
        
        return;
    }

    if (_score > VACUUMING_SIMULATOR_HIGH_SCORE_DATA.val()["highScore"]) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/vacuumingSimulator/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            highScore: _score
        });
        
        console.log("Updated this user's high score, it is now " + score); // remove for final idk
    } else {
        console.log("Didn't update this user's high score");
    }
}