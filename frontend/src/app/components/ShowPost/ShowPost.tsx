import { getDocs, collection } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { useEffect, useState } from "react";
import { Post } from "../Post/Post";
import { PostData } from "@/app/types/interfaces";
import { Loading } from "../Loading/Loading";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Button } from "../Button/Button";

// This component shows posts with likes on the page "create post"
export const ShowPosts = () => {
  // 2 hooks
  const [postsList, setPostsList] = useState<PostData[] | null>(null);
  const postsRef = collection(db, "posts");
  //  This set the list of posts in the postsList
  const getPosts = async () => {
    const data = await getDocs(postsRef);
    setPostsList(
      data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as PostData[]
    ); // as post array
  };
  // The hook performs "side effects". In this case it calls the funtion getPosts again if it is necessary
  useEffect(() => {
    getPosts();
  }, [postsList]);
  // it returns the all posts if it is not null

  const router = useRouter();
  const signUserOut = async () => {
    router.push("/current");
    await signOut(auth);
  };
  return (
    <div>
      {postsList ? (
        <div className="px-4 py-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {postsList.map((post) => (
            <div
              key={post.uniqueId}
              className="p-4 bg-gray-100 rounded-lg shadow"
            >
              <Post post={post} setPostsList={setPostsList} />
            </div>
          ))}
          <div className="col-span-full flex justify-center">
            <Button onClick={signUserOut}>Log Out</Button>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};
