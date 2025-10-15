import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnFpgmDinFEVEOWSW-EmN-0iM7DQavNBo",
  authDomain: "dolph-dd020.firebaseapp.com",
  projectId: "dolph-dd020",
  storageBucket: "dolph-dd020.firebasestorage.app",
  messagingSenderId: "577521790269",
  appId: "1:577521790269:web:5eafa2c2d758dee80fe954",
  measurementId: "G-VPW8SY36YE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

window.signInWithGoogle = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in:", result.user);
        window.location.href = "chat.html";
    } catch (error) {
        console.error("Error signing in:", error);
        alert("Sign in failed: " + error.message);
    }
}

window.signInWithEmail = async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }
    
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", result.user);
        window.location.href = "chat.html";
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            try {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                console.log("User created:", result.user);
                window.location.href = "chat.html";
            } catch (signupError) {
                console.error("Error creating account:", signupError);
                alert("Sign up failed: " + signupError.message);
            }
        } else {
            console.error("Error signing in:", error);
            alert("Sign in failed: " + error.message);
        }
    }
}

window.toggleSignup = function() {
    alert("Enter your email and password to create a new account!");
}

auth.onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = "chat.html";
    }
});
