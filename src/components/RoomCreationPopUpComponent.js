import { auth } from '../config/firebase-config';
import { useState, useEffect } from 'react';
import { collection, doc, addDoc,getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { onAuthStateChanged } from "firebase/auth";

export const RoomCreationPopUpComponent = () => {
    
    const [RoomName, SetRoomName] = useState("");
    const [isRoomPublic, setisRoomPublic] = useState(true);
    const [RoomPassword, SetRoomPassword] = useState("");
    const [isLoading, setIsLoading] = useState(true);  // Add a loading state
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const setisRoomPublicFunc = () => {
        setisRoomPublic(prev => !prev);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, proceed to get their data from Firestore
                const userUID = user.uid;
                try {
                    const docRef = doc(db, "Users", userUID);
                    const getUser = await getDoc(docRef);

                    if (getUser.exists()) {
                        const name = getUser.data().Name;
                        const email = getUser.data().Email;
                        const roomCreated = getUser.data().RoomCreated;
                        setUserName(name);
                        setUserEmail(email);
                    } else {
                        console.log("No Such Document");
                    }
                } catch (err) {
                    console.error("Error fetching document:", err);
                }
            } else {
                console.log("User not authenticated");
                setUserName(""); // Clear username if not authenticated
            }
            setIsLoading(false);  // Stop loading when auth state changes
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    if (isLoading) {
        return <h2>Loading...</h2>;  // Display loading indicator while checking auth state
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        // Ensure that RoomName is not empty
        if (!RoomName) {
            console.error('Room name is required');
            return;
        }

        setIsLoading(true);
      
        try {
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 30); // Document will expire in 1 hour

            // 1. Add a new document to the "Rooms" collection with a random ID (this creates the room)
            const roomDocRef = await addDoc(collection(db, "Rooms"), {
                roomCollectionName: RoomName,
                roomPrivacy: isRoomPublic,
                roomPass: isRoomPublic ? null : RoomPassword,
                expiresAt: expiryTime,
                CreatedBy: userEmail
            });
          
            // 2. Add a message to the "RoomMessages" subcollection under the newly created room document
            const roomMessageRef = await addDoc(collection(roomDocRef, 'RoomMessages'), {
                text: "Hello, this is a message!",
                sentby: userName,
                timestamp: new Date(),
            });
          
            console.log('Room document written with ID: ', roomDocRef.id);  // This will log the random ID
            console.log('Message document written with ID: ', roomMessageRef.id);
    
            // 3. Update the user's document to add the created room ID
            const userUID = auth.currentUser.uid; // Get the current user's UID
            const userDocRef = doc(db, "Users", userUID); // Reference to the user's document
    
            await updateDoc(userDocRef, {
                RoomCreated: true// Update RoomCreated with the new room ID
            });
    
            console.log("User's RoomCreated updated with ID: ", roomDocRef.id);
          
            window.location.reload();

        } catch (error) {
            console.error('Error adding document: ', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
                        <div className='RoomCreationPopUpData'>
                            <div className='RoomCreationPopUpInput'>
                                <label>Room Name:</label>
                                <input type='text' placeholder='Room Name' maxLength={12} value={RoomName} onChange={(e) => SetRoomName(e.target.value)}/>
                            </div>
                            <div className='RoomCreationPopUpButton'>
                                <button onClick={setisRoomPublicFunc} style={ isRoomPublic? {
                                      background: 'linear-gradient(to right, #1A5319 48.5%, #D6EFD8 48.5%)', // Gradient colors
                                }: {
                                    background: 'linear-gradient(to right, #D6EFD8 48.5%, #1A5319 48.5%)'
                                }}>
                                    Public&nbsp;&nbsp;&nbsp;&nbsp;Private
                                </button>
                            </div>
                            {isRoomPublic ? (
                                null
                            ) : (

                                <div className='RoomCreationPopUpPasswordInput'>
                                    <label>Room Pass:</label>
                                    <input type='text' placeholder='Room Password' maxLength={12} value={RoomPassword} onChange={(e) => SetRoomPassword(e.target.value)}/>
                                </div>
                            )}
                        </div>
                        <div className='RoomCreationPopUpSubmitBtn'>
                            <button onClick={handleSubmit}>Submit</button>
                        </div>
        </>
    );
};

export default RoomCreationPopUpComponent;