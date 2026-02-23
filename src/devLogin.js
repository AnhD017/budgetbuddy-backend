import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCd4vhMbEgPWfdmtYIui4bpKNrLWo-1MVM",
  authDomain: "buddgetbuddy.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function login() {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    "test@gmail.com",
    "12345678"
  );

  const token = await userCredential.user.getIdToken();
  console.log("ID TOKEN:\n", token);
}

login();