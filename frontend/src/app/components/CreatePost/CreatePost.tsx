import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../config/firebase";
import { CreateFormData } from "@/app/types/interfaces";
import { dataToSend } from "@/app/types/interfaces";

// CreateForm component represents the form used to create the post
export const CreatePost = () => {
  // 2 hooks from installed libraries
  const [user] = useAuthState(auth);
  const newDate: Date = new Date();
  const unId: string = newDate.toLocaleString();
  // yap scheme with errors handling
  const schema = yup.object().shape({
    title: yup.string().required("You must add a title."),
    description: yup.string().required("You must add a post."),
  });
  // use form hook. Is used to handle yup scheme
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: yupResolver(schema),
  });
  // import posts from Firestore database
  const postsRef = collection(db, "posts");
  // this function is needed as the argument of handleSubmit - using by useForm
  // it does add the posts to the firebase
  const onCreatePost = async (data: CreateFormData) => {
    const dataDoc: dataToSend = {
      ...data,
      uniqueId: unId,
    };
    await addDoc(postsRef, {
      ...dataDoc,
      username: user?.displayName,
      userId: user?.uid, // id used by google
    });
  };
  // The create-form component returns yup validation form
  return (
    <form
      onSubmit={handleSubmit(onCreatePost)}
      className="px-4 py-8 max-w-md mx-auto"
    >
      <h1 className="text-xl font-semibold mb-4 text-center">
        Create your Post about my Project
      </h1>
      <input
        placeholder="Title..."
        {...register("title")}
        className="border border-gray-300 rounded px-4 py-2 mb-2 block w-full"
      />
      {errors.title && (
        <p className="text-red-500 mb-2 text-center">{errors.title.message}</p>
      )}
      <textarea
        placeholder="Description..."
        {...register("description")}
        className="border border-gray-300 rounded px-4 py-2 mb-2 block w-full"
      />
      {errors.description && (
        <p className="text-red-500 mb-2 text-center">
          {errors.description.message}
        </p>
      )}
      <input
        type="submit"
        value="Submit"
        className="bg-blue-500 text-white rounded px-4 py-2 block mx-auto cursor-pointer"
      />
    </form>
  );
};

// This code represents rules used in Firebase with collection colections
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow write, update: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow read, delete: if request.auth != null;
    }
  }
}
*/
