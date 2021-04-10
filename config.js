import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyA3pcZoRS6QDcLj4pe8E4q4PhFY55_WSb0",
  authDomain: "booksanta-eecec.firebaseapp.com",
  databaseURL:"https://booksanta-eecec.firebaseio.com",
  projectId: "booksanta-eecec",
  storageBucket: "booksanta-eecec.appspot.com",
  messagingSenderId: "315112119499",
  appId: "1:315112119499:web:115c0a981837e44a108f4e"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
