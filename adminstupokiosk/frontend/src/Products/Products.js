import { useState, useEffect } from "react";
import ProductsCreate from "./PCreate";
import ProductsUpdate from "./PUpdate";
import ProductsDestroy from "./PDestroy";

const Products = () => {
  const [list, setList] = useState([]);
  const [doFetchList, setDoFetchList] = useState(true);

  const [edit, setEdit] = useState(null);
  const [toDestroy, setToDestroy] = useState(null);

  const fetchList = () => {
    const url = "/api/products/";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data) setList(data);
        else console.log("No data");
      })
      .catch((error) => {
        console.error(error);
      });

    setDoFetchList(false);
  };

  useEffect(() => {
    if (!doFetchList) return;

    fetchList();
  }, [doFetchList]);

  const handleDestroy = (event, toDestroyId) => {
    event.preventDefault();

    fetch("/api/products/destroy", {
      method: "post",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        id: toDestroyId,
      }),
    })
      .then((res) => {
        setDoFetchList(true);
        setToDestroy(null);
      })
      .catch((error) => console.error(error));
  };

  const changeEdit = (element) => {
    setEdit(element);
    window.scrollTo(0, 0);
  };

  return (
    <div className="Products">
      <ProductsCreate setDoFetchList={setDoFetchList} />
      <ProductsUpdate setDoFetchList={setDoFetchList} edit={edit} setEdit={setEdit} />
      <ProductsDestroy handleDestroy={handleDestroy} />

      {edit && (
        <div style={{ backgroundColor: "rgba(100, 100, 200, 0.3)" }}>
          Editing: [{edit.id}] "{edit.name}" <button onClick={() => setEdit(null)}>Clear</button>
        </div>
      )}

      <ul className="List">
        {list.map((element, key) => {
          return (
            <li
              key={key}
              className="ListItem"
              style={{ backgroundColor: edit && edit.id === element.id ? "rgba(100, 100, 200, 0.3)" : "" }}
            >
              <div>Id: {element.id}</div>
              <div>Name: {element.name}</div>
              <div>Keywords: {element.keywords}</div>
              <div>Image: {element.image}</div>
              <div>Description: {element.description}</div>
              <button onClick={() => changeEdit(element)}>Edit</button>
              <button onClick={() => setToDestroy(element)}>Delete</button>
              {toDestroy && toDestroy.id === element.id && (
                <div style={{ backgroundColor: "rgba(255, 100, 100, 0.5)" }}>
                  Are you sure you want to delete [{element.id}] "{element.name}"?{" "}
                  <button onClick={(e) => handleDestroy(e, element.id)}>Yes</button>
                  <button onClick={() => setToDestroy(null)}>No</button>
                </div>
              )}
              <br></br>
              <br></br>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Products;
