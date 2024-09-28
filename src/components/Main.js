import { auth } from '../config/firebase-config';
import { useState, useEffect } from 'react';
import { getDoc, doc, getDocs, collection, deleteDoc,updateDoc,addDoc,docs } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { onAuthStateChanged, signOut } from "firebase/auth";
import RoomCreationPopUpComponent from './RoomCreationPopUpComponent';
import { useNavigate } from 'react-router-dom';
import messagesquare from '../message-square.svg';
import user from '../user.svg';
import userdark from '../userdark.svg';
import plussquare from '../plus-square.svg';
import unlock from '../unlock.svg';
import lock from '../lock.svg'
import menu from '../menu.svg'
import send from '../send.svg'
import mail from '../mail.svg'

export const MainPage = () => {

    //User Variables
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [UserinRoom, setUserInRoom] = useState(false);
    const [UserAlreadyCreatedRoom, setUserAlreadyCreatedRoom] = useState(false);
    const [UserUID, SetUserUID] = useState("");
    
    //Room List/Creation Variables
    const [RoomCreationPopUp, setRoomCreatingPopUp] = useState(false);
    const [Roomlist, setRoomList] = useState([]);
    const RoomCollectionRef = collection(db, "Rooms");
    const [CurrentActiveRoom, setCurrentActiveRoom] = useState("");
    const [RooMiD, setRoomID] = useState("");
    
    //Room Enter Variables
    const [RoomPassword, SetRoomPassword] = useState("");
    const [PubPrivRoomName, setPubPrivRoomName] = useState("");
    const [PubPrivRoomID, setPubPrivRoomID] = useState("");
    const [PubPrivRoomPass, setPubPrivRoomPass] = useState("");
    const [PubPrivRoomCreatedBy, setPubPrivRoomCreatedBy] = useState("");
    const [PrivateRoomEnterPopUp, setPrivateRoomEnterPopUp] = useState(false);

    //Room Chat and Update Variables
    const [MessageList, setMessageList] = useState([]);
    const [textMsg, setTextMsg] = useState("");
    const [UpdateRoomPopUp, setUpdateRoomPopUp] = useState(false);
    const [NewRoomName, setNewRoomName] = useState("");

    //Side bar Variables
    const [sidebarbtnActiveChat, setSideBarBtnActiveChat] = useState(true);

    //Other Variables
    const [isLoading, setIsLoading] = useState(true);  // Add a loading state
    const navigate = useNavigate();


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, proceed to get their data from Firestore
                const userUID = user.uid;
                SetUserUID(userUID);
                try {
                    const docRef = doc(db, "Users", userUID);
                    const getUser = await getDoc(docRef);

                    if (getUser.exists()) {
                        const name = getUser.data().Name;
                        const RoomCreated = getUser.data().RoomCreated;
                        const email = getUser.data().Email;
                        setUserName(name);
                        setUserAlreadyCreatedRoom(RoomCreated);
                        setUserEmail(email);
                    } else {
                        console.log("No Such Document");
                    }
                } catch (err) {
                    console.error("Error fetching document:", err);
                }
                const getRoomList = async () => {
                    try {
                        const data = await getDocs(RoomCollectionRef);
                        const now = new Date();
                
                        const filteredRoomsData = [];
                        const UserDocRefAutoDeleteRoom = doc(db, "Users", userUID);
                        await Promise.all(data.docs.map(async (doc) => {
                            const roomData = doc.data();
                            const expiresAt = roomData.expiresAt ? roomData.expiresAt.toDate() : null;
                
                            if (expiresAt && expiresAt <= now) {
                                // Room has expired, delete it
                                await deleteDoc(doc.ref);
                                console.log("Deleting Room");
                                await updateDoc(UserDocRefAutoDeleteRoom, {
                                    RoomCreated: false,
                                });
                                setUserInRoom(false);
                            } else {
                                // Room is still active, add it to the list
                                filteredRoomsData.push({
                                    ...roomData,
                                    id: doc.id,
                                });
                            }
                        }));
                        
                
                        setRoomList(filteredRoomsData);  // Set the state with the active rooms
                
                    } catch (err) {
                        console.error('Error fetching or deleting rooms:', err);
                    }
                };
                
                setInterval(getRoomList, 3000);
                getRoomList();
            } else {
                console.log("User not authenticated");
                setUserName(""); // Clear username if not authenticated
            }
            setIsLoading(false);  // Stop loading when auth state changes
        });
        setInterval(unsubscribe, 3000);

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    if (isLoading) {
        return <h2>Loading...</h2>;  // Display loading indicator while checking auth state
    }

    //Settings
    const SidebarVarSettingsActive = () => {
        setSideBarBtnActiveChat(false);
    }


    //RoomList
    const SidebarVarChatActive = () => {
        setSideBarBtnActiveChat(true);
    };

    
    //Room Creation
    const RoomCreationPopUpFunc = () => {
        setRoomCreatingPopUp(prev => !prev);
    }

    //Room Enter
    const PrivateRoomEnterFunc = () => {
        setPrivateRoomEnterPopUp(prev => !prev);
    }
    
    //Enter Private Room
    const HandlePasswordSubmit = async (e) => {
        e.preventDefault();
        console.log('Private Room');

        try{
            console.log(RoomPassword);
            console.log(PubPrivRoomPass);
            if(RoomPassword == PubPrivRoomPass){
                setUserInRoom(true);
                getMessages(PubPrivRoomName, PubPrivRoomID);
                PrivateRoomEnterFunc();
            }else{
                console.log("Incorrect Password");
            }
        } catch (error) {
            console.error(error);
        }
    }


    //Room Update
    const UpdateRoomEnterFunc = () => {
        setUpdateRoomPopUp(prev => !prev);
    }

    //Get Messages from Room
    const getMessages = async (PrivroomName, PrivroomID) => {
        try{
                const PrivMsgsRefresh = async () => {
                    setRoomID(PrivroomID);
                    setCurrentActiveRoom(PrivroomName);
                    const messagesCollectionRef = collection(db, "Rooms", PrivroomID, "RoomMessages");
                    const querySnapshot = await getDocs(messagesCollectionRef);
                    const FilteredMessagesFromRoom = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setMessageList(FilteredMessagesFromRoom);
                }
                setInterval(PrivMsgsRefresh,200);
        } catch (error) {
            console.error(error);
        }
    }


    // Sending Chat
    const handleChatSubmit = async (e) => {
        e.preventDefault();
    
        try {
            // Get a reference to the specific room document
            const chatroomDocRef = doc(db, "Rooms", PubPrivRoomID);
            
            // Get a reference to the RoomMessages collection within that room document
            const roomMessageRef = await addDoc(collection(chatroomDocRef, 'RoomMessages'), {
                text: textMsg,
                sentby: userName,
                timestamp: new Date(),
            });
    
            console.log('Message document written with ID: ', roomMessageRef.id);
        } catch (error) {
            console.error('Error adding message: ', error);
        }
    }


    //Updating Room
    const handleRoomUpdate = async (e) =>{
        e.preventDefault();

        try {

            const RoomDocRef = doc(db, "Rooms", PubPrivRoomID);

            if(userEmail == PubPrivRoomCreatedBy){
                console.log("Current user can edit/delete room");
                await updateDoc(RoomDocRef, {
                    roomCollectionName: NewRoomName
                });
                setCurrentActiveRoom(NewRoomName);
            }else{
                console.log("Curretn user can't edit/delete room");
            }
        } catch (err) {
            console.error(err);
        }
    }


    //Deleting Room
    const handleRoomDelete = async () => {

        const UserDocRef = doc(db, "Users", UserUID)

        try{
            console.log("Deleted Room");
            const RoomDocRef = doc(db, "Rooms", PubPrivRoomID);
            await deleteDoc(RoomDocRef);
            await updateDoc(UserDocRef, {
                RoomCreated: false,
            });
            setCurrentActiveRoom("");
            setUserInRoom(false);
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    }

    //Logging Out
    const LogOutWithGoogle = async () => {
        try {
            await signOut(auth);
            console.log("User logged out.");
            navigate('/');
        } catch (err) {
            console.error("Error during sign-out:", err);
        }
    };

    //ClickedRoomToGetMessagesButton
    const GetRoomDataForMessages = async (roomName, roomPrivacy, roomPass, roomID, roomCreatedBy) => { 
        setPubPrivRoomID(roomID);
        setPubPrivRoomName(roomName);
        setPubPrivRoomPass(roomPass);
        setPubPrivRoomCreatedBy(roomCreatedBy);

        if(roomPrivacy){
                const GetMessagesRefresh = async () => {
                    setCurrentActiveRoom(roomName);
                    const messagesCollectionRef = collection(db, "Rooms", roomID, "RoomMessages");
                    const querySnapshot = await getDocs(messagesCollectionRef);
                    
                    const FilteredMessagesFromRoom = querySnapshot.docs.map((doc) => ({
                        id: doc.id, // Include the document ID if needed
                        ...doc.data(), // Spread the document data (message content, timestamp, etc.)
                    }));
                    setMessageList(FilteredMessagesFromRoom);
                    setUserInRoom(true);
                }
                setInterval(GetMessagesRefresh, 200);
        }else{
            if(userEmail == roomCreatedBy){
                setUserInRoom(true);
                getMessages(roomName, roomID);
            }else{
                console.log("Users dont match");
                PrivateRoomEnterFunc();
            }
        }
            
    }

    return (
        <div className='MainBackground'>
            {userName !== "" ? (
                <>
                    {RoomCreationPopUp && !UserAlreadyCreatedRoom ? (
                        <div className='RoomCreationPopUpBG'>
                            <div className='RoomCreationPopUp'>
                                <div className='RoomCreationPopUpHeader'>
                                    <h2>Create a Room</h2>
                                    <button onClick={RoomCreationPopUpFunc}>✖</button>
                                </div>
                                <RoomCreationPopUpComponent/>
                            </div>
                        </div>
                    ): null}
                    {PrivateRoomEnterPopUp  ? (
                        <div className='PrivateRoomEnterPopUpBG'>
                            <div className='PrivateRoomPopUp'>
                                <div className='PrivateRoomPopUpHeader'>
                                    <h2>Enter The Password</h2>
                                    <button className='exitPass' onClick={PrivateRoomEnterFunc}>✖</button>
                                </div>
                                <input type='text' placeholder='Pass' value={RoomPassword} onChange={(e) => SetRoomPassword(e.target.value)}/>
                                <button className='submitPass' onClick={HandlePasswordSubmit}>Submit</button>
                            </div> 
                        </div>
                    ) : null}
                    {UpdateRoomPopUp ? (
                         <div className='UpdateRoomPopUpBG'>
                         <div className='UpdateRoomPopU'>
                             <div className='UpdateRoomPopUpHeader'>
                                 <h2>Update/Delete</h2>
                                 <button className='exitUpdatePass' onClick={UpdateRoomEnterFunc}>✖</button>
                             </div>
                             <input type='text' placeholder='Pass' value={NewRoomName} onChange={(e) => setNewRoomName(e.target.value)}/>
                             <div className='UpdateROomBtns'>
                                <button className='saveUpdates' onClick={handleRoomUpdate}>Save</button>
                                <button className='DeleteRoomBtn' onClick={handleRoomDelete}>Delete Room</button>
                             </div>
                         </div> 
                     </div>
                    ): null}
                    <div className='SideTab'>
                            <button className='SideTabBtn1' onClick={SidebarVarChatActive}><img src={messagesquare}/></button>
                            <button className='SideTabBtn2' onClick={SidebarVarSettingsActive}><img src={user}/></button>
                    </div>
                    <div className='RoomsTab'>
                        {sidebarbtnActiveChat ? (
                            <>
                                <div className='RoomsTabHeader'>
                                    <h1>ChatRooms</h1>
                                    <button onClick={RoomCreationPopUpFunc}><img src={plussquare}/></button>
                                </div>
                                <div className='ActiveRooms'>
                                    {Roomlist.map((room) => (
                                            <button className='RoomsListDiv' onClick={() => GetRoomDataForMessages(room.roomCollectionName, room.roomPrivacy, room.roomPass, room.id, room.CreatedBy)}>
                                                <div className='RoomListInsideDiv'>
                                                    <div className='RoomListInsideDivName'>
                                                        <h2>{room.roomCollectionName}</h2>
                                                    </div>
                                                    <div className='RoomListInsideDivIconDiv'>
                                                        {room.roomPrivacy ? (
                                                            <img src={unlock}/>
                                                        ) : (
                                                            <img src={lock}/>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='RoomsTabHeaderSettings'>
                                    <h1>Settings</h1>
                                </div>
                                <div className='SettingsUserDisplay'>
                                    <div className='settingsusername'>
                                        <img src={userdark}/> 
                                        <h2>{userName}</h2>
                                    </div>
                                    <div className='settingsusermail'>
                                        <img src={mail}/>
                                        <h2>{userEmail}</h2>
                                    </div>
                                    <div className='LogOutButton'>
                                        <button onClick={LogOutWithGoogle}>Log Out</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className='ChatTab'>
                        {UserinRoom? (
                            <>
                                <div className='ChatTabHeader'>
                                    <h1>{CurrentActiveRoom}</h1>
                                    {userEmail == PubPrivRoomCreatedBy ? (
                                        <button onClick={UpdateRoomEnterFunc}><img src={menu}/></button>
                                    ): null}
                                </div>
                                <div className='ChatTabMsgs'>
                                    {MessageList.map((message) => (
                                        <div>
                                            <p>{message.sentby}: {message.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className='ChatTabMsgsInput'>
                                    <input type='text' placeholder='your message' value={textMsg} onChange={(e) => setTextMsg(e.target.value)}/>
                                    <button onClick={handleChatSubmit}><img src={send}/></button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='ChatTabNoRoomActive'>
                                    <h2>Room Chat Display</h2>
                                </div>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <h1>Please log in</h1>
            )}
        </div>
    );
};

export default MainPage;
