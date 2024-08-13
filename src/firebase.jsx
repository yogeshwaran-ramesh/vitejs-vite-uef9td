// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCq_agcJRMRbhD8GLjP98TTkDbChQ0ShFk',
  authDomain: 'doc-ai-editor.firebaseapp.com',
  projectId: 'doc-ai-editor',
  storageBucket: 'doc-ai-editor.appspot.com',
  messagingSenderId: '522194454063',
  appId: '1:522194454063:web:a710e06436953dcd5da8da',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const pdfDb = getStorage(app);
