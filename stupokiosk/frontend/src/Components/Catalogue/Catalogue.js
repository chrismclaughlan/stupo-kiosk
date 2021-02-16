import { useState } from "react";
import CatalogueProducts from "./Products";
import CatalogueCategories from "./Categories";

export default function Catalogue(props) {
//   useEffect(() => {
//     categoriesRef.current = categoriesRef.current.slice(0, props.categoryList.length);
//   }, [props.categoryList]);

  const [showTopBtn, setShowTopBtn] = useState(false);

  return (
    <div>

      <img 
        onClick={() => window.scrollTo(0, 0)}
        className={"fixed inset-x-1/2 w-10 -ml-4 sm:-ml-10 cursor-pointer transition-opacity hover:opacity-60 cursor-pointer" + (!showTopBtn ? " opacity-0" : " opacity-30")}
        src="https://cdn0.iconfinder.com/data/icons/navigation-set-arrows-part-one/32/ArrowUpCircle-256.png"
        alt="Scroll to top"
      ></img>

      {
        (props.productList && props.productList.length !== 0) 
        ? <CatalogueProducts 
            setShowTopBtn={setShowTopBtn}
            setErrorMsg={props.setErrorMsg}
            productList={props.productList}
            addToBasketCallback={props.addToBasketCallback}
          /> 
        : <CatalogueCategories 
            categoriesFilter={props.categoriesFilter}
            setShowTopBtn={setShowTopBtn}
            isEndOfCategories={props.isEndOfCategories}
            setErrorMsg={props.setErrorMsg}
            categoryList={props.categoryList}
            addToBasketCallback={props.addToBasketCallback}
            setFetchingCategoryList={props.setFetchingCategoryList}
          />
      }

    </div>
  );
}
