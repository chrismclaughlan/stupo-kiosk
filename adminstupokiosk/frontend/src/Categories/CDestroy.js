import { useState } from "react";

const CategoriesDestroy = (props) => {
  const [id, setId] = useState("");

  const handleDestroy = (e) => {
    if (!id) return;
    props.handleDestroy(e, id);
  };

  return (
    <div className="CategoriesDestroy">
      <div>Destroy Category</div>
      <form onSubmit={handleDestroy}>
        <input required type="text" placeholder="id" name="id" onChange={(e) => setId(e.target.value)} value={id} />
        <button type="submit">Destroy</button>
      </form>
    </div>
  );
};

export default CategoriesDestroy;
