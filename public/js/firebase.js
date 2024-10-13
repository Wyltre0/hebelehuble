// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBEhDZVcoKT9F6QMKqwTMdppmnO_XZeQtg",
  authDomain: "xtnedblog.firebaseapp.com",
  projectId: "xtnedblog",
  storageBucket: "xtnedblog.appspot.com",
  messagingSenderId: "1005925504150",
  appId: "1:1005925504150:web:f12a2070fe3ed3d1f25eb7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
