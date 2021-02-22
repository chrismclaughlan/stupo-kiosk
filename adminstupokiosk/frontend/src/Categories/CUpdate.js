import { useState, useEffect } from "react";

const CategoriesUpdate = ({ setDoFetchList, edit, setEdit }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!edit) setId("");
    else setId(edit.id);
  }, [edit]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const fd = new FormData();
    fd.append("id", id);
    fd.append("name", name);
    fd.append("image", image);
    fd.append("keywords", keywords);
    fd.append("description", description);

    fetch("/api/categories/update", {
      method: "post",
      body: fd,
    })
      .then((res) => handleReset())
      .catch((error) => console.error(error));
  };

  const handleReset = () => {
    setDoFetchList(true);
    setId("");
    setName("");
    setImage("");
    setKeywords("");
    setDescription("");
  };

  const changeId = (value) => {
    setId(value);
    setEdit("");
  };

  return (
    <div className="CategoriesUpdate">
      <div>Update Category</div>
      <form onSubmit={handleSubmit}>
        <input required type="text" placeholder="id" name="id" onChange={(e) => changeId(e.target.value)} value={id} />
        <input
          required
          type="text"
          placeholder="name"
          name="name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <input
          type="text"
          placeholder="keywords"
          name="keywords"
          onChange={(e) => setKeywords(e.target.value)}
          value={keywords}
        />
        <input
          type="text"
          placeholder="description"
          name="description"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default CategoriesUpdate;
