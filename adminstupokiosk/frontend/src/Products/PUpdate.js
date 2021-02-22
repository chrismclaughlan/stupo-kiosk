import { useState, useEffect } from "react";

const ProductsUpdate = ({ setDoFetchList, edit, setEdit }) => {
  const [id, setId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState("");
  const [priceDiscounted, setPriceDiscounted] = useState("");

  useEffect(() => {
    if (!edit) setId("");
    else setId(edit.id);
  }, [edit]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const fd = new FormData();
    fd.append("id", id);
    fd.append("category_id", categoryId);
    fd.append("name", name);
    fd.append("image", image);
    fd.append("price", price);
    fd.append("price_discounted", priceDiscounted);

    fetch("/api/products/update", {
      method: "post",
      body: fd,
    })
      .then((res) => handleReset())
      .catch((error) => console.error(error));
  };

  const handleReset = () => {
    setDoFetchList(true);
    setId("");
    setCategoryId("");
    setName("");
    setImage("");
    setPrice("");
    setPriceDiscounted("");
  };

  const changeId = (value) => {
    setId(value);
    setEdit("");
  };

  return (
    <div className="ProductsUpdate">
      <div>Update Product</div>
      <form onSubmit={handleSubmit}>
        <input
          required
          type="text"
          placeholder="id"
          name="id"
          onChange={(e) => changeId(e.target.value)}
          value={categoryId}
        />
        <input
          type="text"
          placeholder="category_id"
          name="category_id"
          onChange={(e) => setCategoryId(e.target.value)}
          value={categoryId}
        />
        <input type="text" placeholder="name" name="name" onChange={(e) => setName(e.target.value)} value={name} />
        <input type="text" placeholder="price" name="price" onChange={(e) => setPrice(e.target.value)} value={price} />
        <input
          type="text"
          placeholder="price_discounted"
          name="price_discounted"
          onChange={(e) => setPriceDiscounted(e.target.value)}
          value={priceDiscounted}
        />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default ProductsUpdate;
