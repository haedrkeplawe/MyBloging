import { Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import IndexPage from "./Page/IndexPage";
import LoginPage from "./Page/LoginPage";
import RegisterPage from "./Page/RegisterPage";
import { UserContextProvider } from "./context/UserContext";
import CreatePost from "./Page/CreatePost";
import PostPage from "./Page/PostPage";
import EditPost from "./Page/EditPost";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/edit/:id" element={<EditPost />} />
          </Route>
        </Routes>
      </UserContextProvider>
      <Toaster />
    </>
  );
}

export default App;
