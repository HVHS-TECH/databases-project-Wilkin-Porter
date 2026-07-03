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
// Called by: initialiseIndex()
// Calls: loginButtonDisplay(), fb_checkLoginState()
// Displays login button, then creates a listener that detects changes in the firebase login 
// information stored by the browser, if it detects change it calls fb_checkLoginState and passes the
// login information stored by the browser.
/*****************************************************************************************************/
function fb_authenticationListener() {
    loginButtonDisplay('show');
    firebase.auth().onAuthStateChanged(fb_checkLoginState);
}


/*****************************************************************************************************/
// fb_login()
// Called by: index.html
// Sets logout variable to false, then loads a popup to allow user to sign in to the site
/*****************************************************************************************************/
function fb_login() {
    logout = false;
    let provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider);
}


/*****************************************************************************************************/
// fb_checkLoginState()
// _localUserInformation: This is the local firebase data passed by the authenticationListener
// Called by: fb_authenticationListener()
// Calls: fb_writeGoogleInformation(), and loginButtonDisplay()
// If logout is true, (the user has pressed logout) the function does nothing, if not then it checks if
// the local firebase data passed by the authenticationListener exists, if it does it saves the data to 
// local storage for later later use, and calls fb_writeGoogleInformation(), otherwise it displays the
// login button so the user can log in with google
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


/*****************************************************************************************************/
// fb_writeGoogleInformation()
// _firebaseUserInformation: firebase data read from location /userData/uid
// Called by: fb_checkLoginState()
// Calls: displayLoginInformation(), and loginButtonDisplay()
// Updates Google based user data (from browser), checks to see if _firebaseUserInformation exists, if 
// it doesn't it redirects to details.html because this is likely the users first time logging in / 
// signing up so they don't have data yet. Otherwise it checks if the user hasn't got form data yet, 
// and if the don't also redirects to details.html. If all data exist, it simply displays the user 
// info, hides the login button and shows the logout button
/*****************************************************************************************************/
function fb_writeGoogleInformation(_firebaseUserInformation) {
    firebase.database().ref('userData/' + globalUserInformation['uid']).update({
        googleName: globalUserInformation['displayName'],
        googleEmail: globalUserInformation['email'],
        googleProfileURL: globalUserInformation['photoURL']
    });

    if (!_firebaseUserInformation.val()) {
        // No data exists for user so neither can form details, so redirect to details page
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


/*****************************************************************************************************/
// fb_logout()
// Called by: index.html
// Calls: loginButtonDisplay(), removeLoginInformation();
// This is the function called by the logout button in the index.html page. It sets logout to true so
// the auth listener doesnt try to log the user back in, calls loginButtonDisplay to display the login 
// button and hide the logout button. It then calls removeLoginInformation() to remove the profile
// image and name, before logging the user out of firebase auth.
/*****************************************************************************************************/
function fb_logout() {
    logout = true;
    loginButtonDisplay('show');
    removeLoginInformation();
    firebase.auth().signOut();
}


/*****************************************************************************************************/
// fb_writeVacuumingSimulator() - async
// _timer: a numerical value of the total seconds used for calculations
// _data: a string of mins and seconds that is displayed on the high score list, e.g "6m 12s"
// Called by: updateScoreBoxText() in vacuumingSimulator/vacuumingSimulator.js
// Tries to get user details from session storage and checks if it exists, if not, displays not logged 
// in error. Checks if _timer or _data don't exist. Waits for a firebase read from 
// /vacuumingSimulator/uid, if that data doesn't exist, it reads the user's formName and saves the 
// _timer and _data to the database along with their formName for use in the high score list because 
// their userData folder is not accessable to other users. If their data already exists in the database 
// it only overwrites that existing data if _timer is lower than it, in which case it reads their 
// formName and writes their data like above
/*****************************************************************************************************/
async function fb_writeVacuumingSimulator(_timer, _data) {
    let localUserInformation = JSON.parse(sessionStorage.getItem("sessionUserInformation"));

    if (localUserInformation == null) {
        //console.log("User not logged in, not saving their score"); // In future update this could be displayed as text in the UI
        return;
    }

    if (!_timer || !_data) {
        console.error("fb_writeVacuumingSimulator input parameter/s don't exist");
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
        
        //console.log("Set this user's time, it is now " + _data); // In future update this could be displayed as text in the UI
        return;
    }

    if (_timer < VACUUMING_SIMULATOR_TIMER_DATA.val()["comparisonTime"]) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/vacuumingSimulator/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            comparisonTime: _timer,
            displayTime: _data
        });
        
        // console.log("Updated this user's time, it is now " + _data); // In future update this could be displayed as text in the UI
    } else {
        //console.log("Didn't update this user's time"); // In future update this could be displayed as text in the UI
    }
}


/*****************************************************************************************************/
// fb_writeGeoDash() - async
// _score: the score passed by the geoDash game
// Called by: endGame() in geoDash/geoDash.js
// Tries to get user details from session storage and checks if it exists, if not, displays not logged 
// in error. Checks if _score doesn't exist. Waits for a firebase read from /geoDash/uid, if that data
// doesn't exist, it reads the user's formName and saves their highscore to the database along with 
// their formName for use in the high score list because their userData folder is not accessable to 
// other users. If their data already exists in the database it only overwrites that existing data if
// _score is higher than it, in which case it reads their formName and writes their data like above
/*****************************************************************************************************/
async function fb_writeGeoDash(_score) {
    let localUserInformation = JSON.parse(sessionStorage.getItem("sessionUserInformation"));

    if (localUserInformation == null) {
        //console.log("User not logged in, not saving their score"); // In future update this could be displayed as text in the UI
        return;
    }
    
    if (!_score) {
        console.error("fb_writeGeoDash input parameter/s doesn't exist");
        return;
    } 

    const GEODASH_HIGH_SCORE_DATA = await firebase.database().ref("/geoDash/" + localUserInformation["uid"]).once('value');

    if (GEODASH_HIGH_SCORE_DATA.val() == null) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/geoDash/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            highScore: _score
        });

        //console.log("Set this user's high score, it is now " + _score); // In future update this could be displayed as text in the UI
        return;
    }

    if (_score > GEODASH_HIGH_SCORE_DATA.val()["highScore"]) {
        const FORM_NAME = await firebase.database().ref("/userData/" + localUserInformation["uid"]).once('value');

        firebase.database().ref("/geoDash/" + localUserInformation["uid"]).update({
            formName: FORM_NAME.val()["formName"],
            highScore: _score
        });
        
        //console.log("Updated this user's high score, it is now " + _score); // In future update this could be displayed as text in the UI
    } else {
        //console.log("Didn't update this user's high score"); // In future update this could be displayed as text in the UI
    }
}


/*****************************************************************************************************/
// fb_error()
// Called by: functionName()
// Logs firebase error
/*****************************************************************************************************/
function fb_error(){
    console.error("An error occured while trying to access Firebase.\nThis could be because you don't have permission to access the location, or the location is incorrect.");
}