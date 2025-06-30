import { useEffect } from "react";
import { auth, signInWithGoogle } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./Login.css";
import Link from "next/link";
import { Loading } from "../Loading/Loading";
function Login() {
  const [user, loading] = useAuthState(auth);
  useEffect(() => {
    if (loading) {
      <Loading />;
      return;
    }
    if (user) <Link href="/comments"></Link>;
  }, [user, loading]);
  return (
    <div className="login">
      <div className="login__container">
        <button className="login__btn login__google" onClick={signInWithGoogle}>
          Login with Google
        </button>
      </div>
    </div>
  );
}
export default Login;
