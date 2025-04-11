import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import MainURl from "../MainURL";
import toast from "react-hot-toast";

const Header = () => {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [error, setError] = useState(null);
  useEffect(() => {
    getMe();
  }, []);

  async function getMe() {
    const res = await fetch(MainURl + "/profile", {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      return toast.error("You are not login");
    }
    setUserInfo(data);
  }

  async function logout() {
    const res = await fetch(MainURl + "/logout", {
      credentials: "include",
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      return toast.error(data.message);
    }
    setUserInfo(null);
    getMe();
  }
  const username = userInfo?.username;
  return (
    <header>
      <Link to="" className="logo">
        MyBlog
      </Link>
      <nav>
        {username && (
          <>
            <Link to={"/create"}>Create new post</Link>
            <a onClick={logout}>Logout</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
