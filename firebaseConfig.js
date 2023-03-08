import firebase from 'firebase/compat/app'
import 'firebase/compat/storage'
import { initializeApp } from "firebase/app";

export const firebaseConfig = {
    apiKey: "AIzaSyDGc4HVMKRiqTzqgFIBX6QglIvLoLmTKAQ",
    authDomain: "donation-city.firebaseapp.com",
    projectId: "donation-city",
    storageBucket: "donation-city.appspot.com",
    messagingSenderId: "1007942057600",
    appId: "1:1007942057600:web:c00af113ee83968c2c7065",
    measurementId: "G-T0GTXTZ74Z"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}

const app = initializeApp(firebaseConfig);

export {app, firebase}
