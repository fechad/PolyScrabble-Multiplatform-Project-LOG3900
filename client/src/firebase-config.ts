// Import the functions you need from the SDKs you need
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyCVTU0OZkYmNtKn_Qq8a82MjOMBi2-ho2g',
    authDomain: 'polyscrabble-6fa7a.firebaseapp.com',
    projectId: 'polyscrabble-6fa7a',
    storageBucket: 'polyscrabble-6fa7a.appspot.com',
    messagingSenderId: '925622096737',
    appId: '1:925622096737:web:a0e99e7a9509f8350c6b20',
    measurementId: 'G-5SNQFGZNV5',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
