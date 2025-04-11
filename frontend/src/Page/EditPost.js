import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Navigate, useParams } from "react-router-dom";
import MainURL from "../MainURL";
import toast from "react-hot-toast";

const EditPost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [img, setImg] = useState("");
  const [uupdating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(MainURL + "/post/" + id).then((response) => {
      response.json().then((postInfo) => {
        setTitle(postInfo.title);
        setContent(postInfo.content);
        setSummary(postInfo.summary);
      });
    });
  }, []);

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

  async function updatePost(ev) {
    ev.preventDefault();
    setUpdating(true);
    const response = await fetch(MainURL + "/post", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, title, summary, content, img }),
      credentials: "include",
    });
    if (response.ok) {
      setRedirect(true);
      toast.success("Updated");
    }
  }

  if (redirect) {
    return <Navigate to={"/post/" + id} />;
  }

  return (
    <form onSubmit={updatePost}>
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
      <input type="file" onChange={handleImgChange} />
      <ReactQuill value={content} onChange={setContent} />
      <button disabled={uupdating} style={{ marginTop: "5px" }}>
        {!uupdating ? "Update post" : "Updateing..."}
      </button>
    </form>
  );
};

export default EditPost;
