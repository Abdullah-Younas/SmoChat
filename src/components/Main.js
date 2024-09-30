import { auth } from '../config/firebase-config';
import { useState, useEffect } from 'react';
import { getDoc, doc, getDocs, collection, deleteDoc,updateDoc,addDoc,docs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
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
import x from '../x.svg'
import trash from '../trash-2.svg'
import logout from '../log-out.svg'
import { Timestamp } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

const MIN_WIDTH = 700; // Set your minimum width threshold (e.g., 1024px)
const MIN_HEIGHT = 400; // Set your minimum height threshold (e.g., 768px)



export const MainPage = () => {

    //SECRET_KEY 
    const SECRET_KEY = 'wf1-g2$G31-g2_3g2#!@RQ@FA2g#%#&#g34_h3_H43^%&_8665_75'

    const [showAccessDenied, setShowAccessDenied] = useState(false);

    //Mobile
    const isWidthHeightLow = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
      
        // Check if the user agent indicates a mobile device or if dimensions are below set thresholds
        return screenWidth < MIN_WIDTH || screenHeight < MIN_HEIGHT;
    };

    const handleResize = () => {
        setShowAccessDenied(isWidthHeightLow());
    };

    //User Variables
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [UserinRoom, setUserInRoom] = useState(false);
    const [UserAlreadyCreatedRoom, setUserAlreadyCreatedRoom] = useState(false);
    const [UserUID, SetUserUID] = useState("");
    const [EncryptedUserEmail, SetEncryptedUserEmail] = useState("");
    
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
    const [PubPrivRoomTimer, setPubPrivRoomTimer] = useState("");

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
    const LeaveRoom = () => {
        window.location.reload();
    }
    const EnterRoom = () => {
        setUserInRoom(true);
    }
    function DecryptEmail(PrivateEmail){
        const bytes = CryptoJS.AES.decrypt(PrivateEmail, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    useEffect(() => {
      
        handleResize();

        window.addEventListener('resize', handleResize);
        let isMounted = true; // Flag to track if component is mounted
        let intervalId; // Define intervalId
    
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
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
                        SetEncryptedUserEmail(email);
                        const DecryptedEmail = DecryptEmail(email);
                        setUserEmail(DecryptedEmail);
                    } else {
                        console.log("No Such Document");
                    }
                } catch (err) {
                    console.error("Error fetching document:", err);
                }
    
                // Call your function to get room list and set loading state to false
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
                                LeaveRoom();
                            } else {
                                // Room is still active, add it to the list
                                filteredRoomsData.push({
                                    ...roomData,
                                    id: doc.id,
                                });
                            }
                        }));
                        // Your existing logic for filtering rooms
                        if (isMounted) {
                            setRoomList(filteredRoomsData);
                        }
                    } catch (err) {
                        console.error('Error fetching or deleting rooms:', err);
                    }
                };
    
                await getRoomList(); // Fetch rooms immediately
    
                // Set an interval for refreshing messages or other data
                intervalId = setInterval(() => {
                    // Your refresh logic here
                }, 200); // Example interval duration
    
            } else {
                console.log("User not authenticated");
                setUserName(""); // Clear username if not authenticated
            }
            if (isMounted) {
                setIsLoading(false); // Stop loading when auth state changes
            }
        });
    
        return () => {
            clearInterval(intervalId); // Clear interval on unmount
            unsubscribe(); // Unsubscribe from auth state listener
            window.removeEventListener('resize', handleResize);
            isMounted = false; // Set flag to false when unmounted
        };
    }, []);
    

    if (isLoading) {
        return <h2>Loading...</h2>;  // Display loading indicator while checking auth state
    }


    //Timestamp
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "No time set"; // Handle null or undefined timestamps
        const date = timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }; // Set options for 24-hour format
        return date.toLocaleTimeString([], options); // Return only the time
    };

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

        try{
            if(RoomPassword == PubPrivRoomPass){
                EnterRoom();
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
                    const q = query(messagesCollectionRef, orderBy("timestamp", "asc"));
                    const querySnapshot = await getDocs(q);
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
    
        } catch (error) {
            console.error('Error adding message: ', error);
        }
    }


    //Deleting Room
    const handleRoomDelete = async () => {

        const UserDocRef = doc(db, "Users", UserUID)

        try{
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
            localStorage.removeItem("username");
            navigate('/');
            window.location.reload();
        } catch (err) {
            console.error("Error during sign-out:", err);
        }
    };

    //ClickedRoomToGetMessagesButton
    const GetRoomDataForMessages = async (roomName, roomPrivacy, roomPass, roomID, roomCreatedBy, roomExpiresAt) => { 
        setPubPrivRoomID(roomID);
        setPubPrivRoomName(roomName);
        setPubPrivRoomPass(roomPass);
        setPubPrivRoomCreatedBy(roomCreatedBy);

        const formattedTimeExpiresAt = formatTimestamp(roomExpiresAt);
        setPubPrivRoomTimer(formattedTimeExpiresAt);


        if(roomPrivacy){
                const GetMessagesRefresh = async () => {
                    setCurrentActiveRoom(roomName);
                    const messagesCollectionRef = collection(db, "Rooms", roomID, "RoomMessages");
                    const q = query(messagesCollectionRef, orderBy("timestamp", "asc"));
                    const querySnapshot = await getDocs(q);
                    const FilteredMessagesFromRoom = querySnapshot.docs.map((doc) => ({
                        id: doc.id, // Include the document ID if needed
                        ...doc.data(), // Spread the document data (message content, timestamp, etc.)
                    }));
                    setMessageList(FilteredMessagesFromRoom);
                    EnterRoom();
                }
                setInterval(GetMessagesRefresh, 200);
        }else{
            if(userEmail == DecryptEmail(roomCreatedBy)){
                EnterRoom();
                getMessages(roomName, roomID);
            }else{
                PrivateRoomEnterFunc();
            }
        }
            
    }

    return (
        <div className='MainBackground'>
            {userName !== "" && !showAccessDenied ? (
                <>
                    {RoomCreationPopUp && !UserAlreadyCreatedRoom ? (
                        <div className='RoomCreationPopUpBG'>
                            <div className='RoomCreationPopUp'>
                                <div className='RoomCreationPopUpHeader'>
                                    <h2>Create a Room</h2>
                                    <button onClick={RoomCreationPopUpFunc}><img src={x} alt='cross'/></button>
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
                                    <button className='exitPass' onClick={PrivateRoomEnterFunc}><img src={x} alt='cross'/></button>
                                </div>
                                <div className='PrivateRoomPopUpEnterPass'>
                                    <input type='text' placeholder='Pass' value={RoomPassword} onChange={(e) => SetRoomPassword(e.target.value)}/>
                                    <button className='submitPass' onClick={HandlePasswordSubmit}>Submit</button>
                                </div>
                            </div> 
                        </div>
                    ) : null}
                    {UpdateRoomPopUp ? (
                         <div className='UpdateRoomPopUpBG'>
                         <div className='UpdateRoomPopU'>
                                <h2>Confirm?</h2>
                             <div className='UpdateROomBtns'>
                                <button className='DeleteRoomBtn' onClick={handleRoomDelete}>YES</button>
                                <button className='DeleteRoomBtn' onClick={UpdateRoomEnterFunc}>NO</button>
                             </div>
                         </div> 
                     </div>
                    ): null}
                    <div className='SideTab'>
                            <button className='SideTabBtn1' onClick={SidebarVarChatActive}><img src={messagesquare} alt='chat'/></button>
                            <button className='SideTabBtn2' onClick={SidebarVarSettingsActive}><img src={user} alt='useroptions'/></button>
                    </div>
                    <div className='RoomsTab'>
                    {sidebarbtnActiveChat && !UserinRoom ? (
                    // Case 1: Not in a room, and sidebar active — show chat rooms
                    <>
                        <div className='RoomsTabHeader'>
                            <h1>ChatRooms</h1>
                            <button onClick={RoomCreationPopUpFunc}>
                                <img src={plussquare} alt='newroom' />
                            </button>
                        </div>
                        <div className='ActiveRooms'>
                            {Roomlist.map((room) => (
                                <button
                                    key={room.id} // Always use a key in lists
                                    className='RoomsListDiv'
                                    onClick={() => GetRoomDataForMessages(room.roomCollectionName, room.roomPrivacy, room.roomPass, room.id, room.CreatedBy, room.expiresAt)}
                                >
                                    <div className='RoomListInsideDiv'>
                                        <div className='RoomListInsideDivName'>
                                            <h2>{room.roomCollectionName}</h2>
                                        </div>
                                        <div className='RoomListInsideDivIconDiv'>
                                            {room.roomPrivacy ? (
                                                <img src={unlock} alt='publicroom' />
                                            ) : (
                                                <img src={lock} alt='privateroom' />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : UserinRoom ? (
                    !sidebarbtnActiveChat ? (
                        // Case 2: In a room and sidebar not active — show settings
                        <>
                            <div className='RoomsTabHeaderSettings'>
                                <h1>Settings</h1>
                            </div>
                            <div className='SettingsUserDisplay'>
                                <div className='settingsusername'>
                                    <img src={userdark} alt='username' />
                                    <h2>{userName}</h2>
                                </div>
                                <div className='settingsusermail'>
                                    <img src={mail} alt='email' />
                                    <h2>{userEmail}</h2>
                                </div>
                            </div>
                            <div className='LogOutButton'>
                                <button onClick={LogOutWithGoogle}>Log Out</button>
                            </div>
                        </>
                    ) : (
                        // Case 3: In a room and sidebar active — show "Leave Current Room"
                        <>
                            <div className='LeaveRoomHeader'>
                                <div className='LeaveRoomHeaderTab'>
                                    <h1>ChatRooms</h1>
                                </div>
                                <div className='LeaveRoomButtonSideTab'>
                                    <h3>To Display Rooms, Please Leave Current Room</h3>
                                </div>
                            </div>
                        </>
                    )
                ) : !sidebarbtnActiveChat && !UserinRoom ? (
                    // Case 4: Sidebar not active and user not in a room — display settings
                    <>
                        <div className='RoomsTabHeaderSettings'>
                            <h1>Settings</h1>
                        </div>
                        <div className='SettingsUserDisplay'>
                            <div className='settingsusername'>
                                <img src={userdark} alt='username' />
                                <h2>{userName}</h2>
                            </div>
                            <div className='settingsusermail'>
                                <img src={mail} alt='email' />
                                <h2>{userEmail}</h2>
                            </div>
                        </div>
                        <div className='LogOutButton'>
                            <button onClick={LogOutWithGoogle}>Log Out</button>
                        </div>
                    </>
                ) : null}

                    </div>
                    <div className='ChatTab'>
                        {UserinRoom? (
                            <>
                                <div className='ChatTabHeader'>
                                    <h1>{CurrentActiveRoom}</h1>
                                    {EncryptedUserEmail == PubPrivRoomCreatedBy ? (
                                        <>
                                            <div className='ChatTabHeaderButtons'>
                                                <p>Expires At: {PubPrivRoomTimer}</p>
                                                <button onClick={UpdateRoomEnterFunc}><img src={trash} alt='delete'/></button>
                                                <button onClick={LeaveRoom}><img src={logout} alt='leaveRoom'/></button>
                                            </div>
                                        </>
                                    ): 
                                        <>
                                            <div className='ChatTabHeaderButtons'>
                                                <p>Expires At: {PubPrivRoomTimer}</p>
                                                <button onClick={LeaveRoom}><img src={logout} alt='exitRoom'/></button>
                                            </div>
                                        </>
                                    }
                                </div>
                                <div className='ChatTabMsgs'>
                                {MessageList
                                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sort by timestamp
                                .map((message) => (
                                    <div key={message.id} className='TextMSG'> {/* Ensure each message has a unique key */}
                                        <p>{message.sentby}: {message.text}</p>
                                    </div>
                                ))}
                                </div>
                                <div className='ChatTabMsgsInput'>
                                    <input type='text' placeholder='your message' value={textMsg} onChange={(e) => setTextMsg(e.target.value)}/>
                                    <button onClick={handleChatSubmit}><img src={send} alt='sendtext'/></button>
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
            ) : ( userName == "" && !showAccessDenied ? (
                <h1>Please log in</h1>
            
            ): 
                <div>
                    <h1>Access Denied</h1>
                    <h2>One of the two reasons:</h2>
                    <p>This website is only accessible on computers or laptops.</p>
                    <p>This website is only accessible above a widht of 700 and height of 400</p>
                </div>
            )}
        </div>
    );
};

export default MainPage;
