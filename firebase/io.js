let logout;
let waitingForDetails = true;
let globalUserInformation;
let authenticationListener;

function fb_login() {
    logout = false;
    authenticationListener = firebase.auth().onAuthStateChanged(fb_checkLoginState)
}

function fb_checkLoginState(localUserInformation) {
    if (logout == true) {
        return;
    }
    if (localUserInformation) {
        globalUserInformation = localUserInformation;
        firebase.database().ref('/userdata').child(globalUserInformation['uid']).once('value', fb_checkExistingData, fb_error);
    } else {
        fb_loginPopup();
    }
}

function fb_checkExistingData(firebaseUserInformation) {
    // If local name is different from the name stored in firebse, update the firebase name with the local name
    if (firebaseUserInformation.val()['googleName'] != globalUserInformation['displayName']) {
        firebase.database().ref('userdata/' + globalUserInformation['uid']).update({googleName: globalUserInformation['displayName']});
        //console.log("updated name");
    } else {
        //console.log("didn't update name");
    }

    // If local email is different from the email stored in firebse, update the firebase email with the local email
    if (firebaseUserInformation.val()['googleEmail'] != globalUserInformation['email']) {
        firebase.database().ref('userdata/' + globalUserInformation['uid']).update({googleEmail: globalUserInformation['email']});
        //console.log("updated email");
    } else {
        //console.log("didn't update email");
    }

    // If local profile URL is different from the profile URL stored in firebse, update the firebase profile URL with the local profile URL
    if (firebaseUserInformation.val()['googleProfileURL'] != globalUserInformation['photoURL']) {
        firebase.database().ref('userdata/' + globalUserInformation['uid']).update({googleProfileURL: globalUserInformation['photoURL']});
        //console.log("updated profile url");
    } else {
        //console.log("didn't update profile email");
    }

    if (('formName' in firebaseUserInformation.val()) == true) {
        console.log("form name exists");
        displayLoginInformation(firebaseUserInformation.val()['formName'], firebaseUserInformation.val()['googleProfileURL']);
        loginButtonDisplay('hide');
    } else {
        console.log("form name doesn't exist");
        window.location.href = "details.html";
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
    console.error('something went wrong')
}


/*
firebase.database().ref('userdata').update({
    [localUserInformation['uid']]: {
        userName: localUserInformation['displayName'],
        email: localUserInformation['email'],
        profileURL: localUserInformation['photoURL']
    }
});
globalUserInformation = localUserInformation;
displayLoginInformation();
loginButtonDisplay('hide');
*/