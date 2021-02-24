import { useContext } from "react";
import CatalogueProducts from "./Products";
import CatalogueCategories from "./Categories";
import { ItemsContext } from "../Contexts";

const Catalogue = (props) => {
  const { productList } = useContext(ItemsContext);
  //   useEffect(() => {
  //     categoriesRef.current = categoriesRef.current.slice(0, props.categoryList.length);
  //   }, [props.categoryList]);

  return (
    <div>
      <img
        onClick={() => window.scrollTo(0, 0)}
        className={
          "z-50 fixed inset-x-1/2 w-10 -ml-4 sm:-ml-10 cursor-pointer transition-opacity hover:opacity-60 cursor-pointer" +
          (!props.showTopBtn ? " opacity-0" : " opacity-30")
        }
        src="https://cdn0.iconfinder.com/data/icons/navigation-set-arrows-part-one/32/ArrowUpCircle-256.png"
        alt="Scroll to top"
      ></img>

      {productList && productList.length !== 0 ? (
        <CatalogueProducts setShowTopBtn={props.setShowTopBtn} setErrorMsg={props.setErrorMsg} />
      ) : (
        <CatalogueCategories setShowTopBtn={props.setShowTopBtn} setErrorMsg={props.setErrorMsg} />
      )}
    </div>
  );
};

export default Catalogue;
