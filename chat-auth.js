import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        updateUserProfile(user);
    } else {
        window.location.href = "login.html";
    }
});

function updateUserProfile(user) {
    const userName = user.displayName || user.email.split('@')[0];
    const userPhoto = user.photoURL;
    
    const userNameElement = document.querySelector('.user-profile span');
    const userAvatarElement = document.querySelector('.user-profile .avatar');
    
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    if (userAvatarElement) {
        if (userPhoto) {
            userAvatarElement.innerHTML = `<img src="${userPhoto}" alt="${userName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            userAvatarElement.textContent = userName.charAt(0).toUpperCase();
        }
    }
    
    window.currentUserName = userName;
    window.currentUserPhoto = userPhoto;
}

export { currentUser };
