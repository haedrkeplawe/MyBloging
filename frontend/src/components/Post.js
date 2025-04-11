import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";
import MainURL from "../MainURL";

const Post = ({ _id, title, summary, cover, content, author, createdAt }) => {
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <div
            className="img"
            style={{
              backgroundImage: `url(${cover})`,
            }}
          />
        </Link>
      </div>
      <div className="texts">
        <Link to={"/post/id"}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a className="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
};

export default Post;
