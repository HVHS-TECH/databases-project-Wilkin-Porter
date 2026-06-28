/*****************************************************************************************************/
// Firebase: io.js
// Firebase script used mainly for database operations
// Written by Wilkin Porter - Term 2 2026
/*****************************************************************************************************/


/*****************************************************************************************************/
// Global Variables, Constants and Arrays
/*****************************************************************************************************/
let logout;
let globalUserInformation;


/*****************************************************************************************************/
// fb_authenticationListener()
// Called by initialiseIndex()
// Displays login button, then creates a listener that detects changes in the firebase login 
// information stored by the browser
/*****************************************************************************************************/
function fb_authenticationListener() {
    loginButtonDisplay('show');
    firebase.auth().onAuthStateChanged(fb_checkLoginState);
}


/*****************************************************************************************************/
// fb_login()
// Called by lo0gin button in index.html
// Sets logout variable to false, then loads a popup to allow user to sign in to the site
/*****************************************************************************************************/
function fb_login() {
    logout = false;
    let provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider);
}


/*****************************************************************************************************/
// fb_checkLoginState(parameter1)
// Parameter 1: This is the local firebase data passed by the authenticationListener
// Called by fb_authenticationListener()
// If logout is true, (the user has pressed logout) the function does nothing, if not then it checks if
// the local firebase data passed by the authenticationListener exists, if it does it saves the data to 
// local storage for later later use, and calls fb_writeGoogleInformation
/*****************************************************************************************************/
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
    if (!_score) {
        console.error("fb_writeGeoDash input parameter/s doesn't exist");
        return;
    }

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

        console.log("Set this user's high score, it is now " + _score); // remove for final idk

        return;
    }

    if (_score > GEODASH_HIGH_SCORE_DATA.val()["highScore"]) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/geoDash/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            highScore: _score
        });
        
        console.log("Updated this user's high score, it is now " + _score); // remove for final idk
    } else {
        console.log("Didn't update this user's high score");
    }
}

async function fb_writeVacuumingSimulator(_timer, _data) {
    if (!_timer || !_data) {
        console.error("fb_writeVacuumingSimulator input parameter/s doesn't exist");
        return;
    }

    let localUserInformation = JSON.parse(sessionStorage.getItem("sessionUserInformation")); // could change to const
    
    if (localUserInformation == null) {
        console.log("User not logged in, not saving their score"); // remove for final idk
        return;
    }

    const VACUUMING_SIMULATOR_TIMER_DATA = await firebase.database().ref("/vacuumingSimulator/" + localUserInformation["uid"]).once('value');

    if (VACUUMING_SIMULATOR_TIMER_DATA.val() == null) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/vacuumingSimulator/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            comparisonTime: _timer,
            displayTime: _data
        });
        
        console.log("Set this user's time, it is now " + _data); // remove for final idk

        return;
    }

    if (_timer < VACUUMING_SIMULATOR_TIMER_DATA.val()["comparisonTime"]) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/vacuumingSimulator/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            comparisonTime: _timer,
            displayTime: _data
        });
        
        console.log("Updated this user's time, it is now " + _data); // remove for final idk
    } else {
        console.log("Didn't update this user's time");
    }
}