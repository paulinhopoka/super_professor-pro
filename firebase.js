import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Configuração direta (Substituindo o arquivo externo para não dar erro no GitHub)
const firebaseConfig = {
  apiKey: "AIzaSyDXq8ysW6Lb3JUROiUZObz-ONcBJWADt5A",
  authDomain: "gen-lang-client-0786840861.firebaseapp.com",
  projectId: "gen-lang-client-0786840861",
  storageBucket: "gen-lang-client-0786840861.firebasestorage.app",
  messagingSenderId: "1047277581781",
  appId: "1:1047277581781:web:a908e0f37f2fe63cb9795c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Importante: Usamos o ID do banco de dados específico do seu projeto
export const db = getFirestore(app, "ai-studio-71d09197-cb18-4b0e-bd39-6c05c890df19");
export const provider = new GoogleAuthProvider();

export { 
  signInWithPopup, signOut, onAuthStateChanged, 
  doc, getDoc, setDoc, onSnapshot, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  collection, getDocs, query, where
};
