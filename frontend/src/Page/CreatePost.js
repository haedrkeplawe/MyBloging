import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Navigate } from "react-router-dom";
import MainURL from "../MainURL";
import toast from "react-hot-toast";
const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function createNewPost(ev) {
    ev.preventDefault();
    if (!title || !summary || !content || !img) {
      toast.error("Please fill all filed");
      return;
    }
    setCreating(true);
    const response = await fetch(MainURL + "/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, summary, content, img }),
      credentials: "include",
    });
    if (response.ok) {
      setRedirect(true);
      toast.success("created");
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <form onSubmit={createNewPost}>
      <input
        type="title"
        placeholder={"Title"}
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <input
        type="summary"
        placeholder={"Summary"}
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
      />
      <input type="file" accept="image/*" onChange={handleImgChange} />
      <ReactQuill value={content} onChange={setContent} />
      <button disabled={creating} style={{ marginTop: "5px" }}>
        {!creating ? "Create post" : "Creating..."}
      </button>
    </form>
  );
};

export default CreatePost;
