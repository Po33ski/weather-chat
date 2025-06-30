"use client";
import { Chat } from "../components/Chat/Chat";

export const ChatPage = () => {
  return (
    <>
      <div className="chat-page">
        <Chat />
      </div>
    </>
  );
};



// import { useAuthState } from "react-firebase-hooks/auth";
// export const Comments = () => {
//   const [user] = useAuthState(auth);
//   return (
//     <>
//       {user ? (
//         <div>
//           <CreatePost />
//           <ShowPosts />
//         </div>
//       ) : (
//         <Login />
//       )}
//     </>
//   );
// };