import { auth, GoogleAuth } from '../config/firebase-config';
import { signInWithPopup, signOut } from "firebase/auth";
import { db } from '../config/firebase-config';
import { useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
    const [Username, setUsername] = useState("");

    const navigate = useNavigate();

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, GoogleAuth);
            const user = result.user;  // Get the user details from the result
            setUsername(user.displayName);  // Set the username in state

            
            const userDocRef = doc(db, "Users", user.uid);

            
            await setDoc(userDocRef, {
                Name: user.displayName,
                UserUID: user.uid,
                Email: user.email,
                RoomCreated: false
            });
            navigate('/success');

        } catch (err) {
            console.error("Error during sign-in:", err);
        }
    };

    const LogOutWithGoogle = async () => {
        try {
            await signOut(auth);
            setUsername("");  // Clear the username after sign-out
            console.log("User logged out.");
        } catch (err) {
            console.error("Error during sign-out:", err);
        }
    };

    return (
        <div>
            <button onClick={signInWithGoogle}>Sign In With Google</button>
            <button onClick={LogOutWithGoogle}>Log Out</button>
        </div>
    );
};

export default Auth;
