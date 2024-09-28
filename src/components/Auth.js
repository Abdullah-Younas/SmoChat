import { auth, GoogleAuth } from '../config/firebase-config';
import { signInWithPopup, signOut } from "firebase/auth";
import { db } from '../config/firebase-config';
import { useEffect, useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
    const [Username, setUsername] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if(storedUsername){
            setUsername(storedUsername);
        }
    }, [])

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, GoogleAuth);
            const user = result.user;  // Get the user details from the result
            setUsername(user.displayName);  // Set the username in state
            localStorage.setItem("username", user.displayName);
            
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
    const AlreadySignedIn = () => {
        navigate('/success');
    }

    const LogOutWithGoogle = async () => {
        try {
            await signOut(auth);
            setUsername("");  // Clear the username after sign-out
            localStorage.removeItem("username");
            console.log("User logged out.");
        } catch (err) {
            console.error("Error during sign-out:", err);
        }
    };

    return (
        <>
            <div className='corneruserauth'>
                {Username ? (
                    <h4>{Username} logged in</h4>
                ) : (
                    <h4>logged out</h4>
                )}
            </div>
            <div className='MainAuth'>
                <div className='Header'>
                    <h1>SMOCHAT</h1>
                </div>
                <div className='Auth'>
                    {Username ? (
                        <>
                            <button onClick={AlreadySignedIn}>Continue</button>
                            <button onClick={LogOutWithGoogle}>Log Out</button>
                        </>
                    ) : (
                        <>
                            <button onClick={signInWithGoogle}>Sign In With Google</button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Auth;
