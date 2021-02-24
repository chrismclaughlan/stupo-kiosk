import { useState } from "react";

const CategoriesCreate = ({ setDoFetchList }) => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const fd = new FormData();
    fd.append("name", name);
    fd.append("image", image);
    fd.append("keywords", keywords);
    fd.append("description", description);

    fetch("/api/categories/create", {
      method: "post",
      body: fd,
    })
      .then((res) => {
        handleReset();
      })
      .catch((error) => console.error(error));
  };

  const handleReset = () => {
    setDoFetchList(true);
    setName("");
    setImage("");
    setKeywords("");
    setDescription("");
  };

  return (
    <div className="CategoriesCreate">
      <div>Create new Category</div>
      <form onSubmit={handleSubmit}>
        <input
          required
          type="text"
          placeholder="name"
          name="name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <input
          required
          type="text"
          placeholder="keywords"
          name="keywords"
          onChange={(e) => setKeywords(e.target.value)}
          value={keywords}
        />
        <input
          required
          type="text"
          placeholder="description"
          name="description"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CategoriesCreate;
