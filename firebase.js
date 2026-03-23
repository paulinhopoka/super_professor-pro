import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Carrega a configuração do arquivo JSON
const configResponse = await fetch('./firebase-applet-config.json');
const firebaseConfig = await configResponse.json();

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const provider = new GoogleAuthProvider();

export { 
  signInWithPopup, signOut, onAuthStateChanged, 
  doc, getDoc, setDoc, onSnapshot, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  collection, getDocs, query, where
};
