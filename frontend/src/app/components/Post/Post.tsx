import { useEffect, useState } from "react";
import { db, auth } from "../../config/firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { PostData, PropsData, LikeData } from "../../types/interfaces";

// This component represents the list of posts with likes handling
export const Post = (props: PropsData) => {
  const { post } = props;
  // give us information about the user
  const [user] = useAuthState(auth);
  // hook use state - likes is the list of Like interface
  const [likes, setLikes] = useState<LikeData[] | null>(null);
  // import likes from Firestore database
  const likesRef = collection(db, "likes");
  // import posts from Firestore database
  const postsRef = collection(db, "posts");
  // The database query get the likes with proper id (related to post)
  const likesDoc = query(likesRef, where("postId", "==", post.id)); // using by getLikes
  // it sets likes mapping the list of likes
  const getLikes = async () => {
    const data = await getDocs(likesDoc);
    setLikes(
      data.docs.map((doc) => ({ userId: doc.data().userId, likeId: doc.id }))
    );
  };
  // This funtion add likes to the database
  const addLike = async () => {
    try {
      // exception handling
      const newDoc = await addDoc(likesRef, {
        userId: user?.uid,
        postId: post.id,
      }); // add new doc and get the doc in the same time
      if (user) {
        // set likes with condition
        setLikes((prev) =>
          prev
            ? [...prev, { userId: user.uid, likeId: newDoc.id }]
            : [{ userId: user.uid, likeId: newDoc.id }]
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  // This funtion remove likes from database
  const removeLike = async () => {
    try {
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", user?.uid)
      );

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      const likeId = likeToDeleteData.docs[0].id;
      const likeToDelete = doc(db, "likes", likeId);
      await deleteDoc(likeToDelete);
      if (user) {
        // if not equal set the like
        setLikes(
          (prev) => prev && prev.filter((like) => like.likeId !== likeId)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const removePost = async () => {
    try {
      const postToDeleteQuery = query(
        postsRef,
        where("uniqueId", "==", post.uniqueId),
        where("userId", "==", user?.uid)
      );

      const postToDeleteData = await getDocs(postToDeleteQuery);
      const postId = postToDeleteData.docs[0].id;

      const postToDelete = doc(db, "posts", postId);
      await deleteDoc(postToDelete);
      if (user) {
        // delete post
        props.setPostsList(
          (prev) => prev && prev.filter((post) => post.id !== postToDelete.id)
        );
      }
      // delete likes
      const likeToDeleteQuery = query(likesRef, where("postId", "==", post.id));

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      for (let i = 0; i < likeToDeleteData.docs.length; i++) {
        const likeId = likeToDeleteData.docs[i].id;
        const likeToDelete = doc(db, "likes", likeId);
        await deleteDoc(likeToDelete);
        if (user) {
          // if not equal set the like
          setLikes(
            (prev) => prev && prev.filter((like) => like.likeId !== likeId)
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  // It checks if the user have added like before or no
  const hasUserLiked = likes?.find((like) => like.userId === user?.uid);
  // The hook performs "side effects".
  useEffect(() => {
    getLikes();
  }, []);
  // The post component returns the list of posts
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h1 className="text-xl font-semibold mb-2">{post.title}</h1>
      <p className="mb-4">{post.description}</p>
      <p className="text-gray-500 mb-2">@{post.username}</p>
      <p className="mb-4"> {post.uniqueId}</p>
      <div className="flex items-center">
        <button onClick={hasUserLiked ? removeLike : addLike}>
          {hasUserLiked ? "❤️" : "🤍"}
        </button>
        <p className="text-gray-500 mr-2">Likes: {likes?.length}</p>
        <button onClick={removePost} className="text-red-500">
          &#10006;
        </button>
      </div>
    </div>
  );
};
