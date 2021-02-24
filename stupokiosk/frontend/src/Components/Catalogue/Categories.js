import { useState, useEffect, useRef, useContext } from "react";
import Category from "../Category";
import { ItemsContext } from "../Contexts";

const CatalogueCategories = (props) => {
  const { categoryList, isEndOfCategories, setFetchingCategoryList, categoriesFilter } = useContext(ItemsContext);
  const [categorySelectionIndex, setCategorySelectionIndex] = useState(null);
  const lastScroll = useRef(0);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) setFetchingCategoryList(true);

    let currentScroll = document.documentElement.scrollTop;
    if (lastScroll.current > 0 && (currentScroll > lastScroll.current || currentScroll < 200)) {
      /* Scrolling down */
      props.setShowTopBtn(false);
    } else {
      /* Scrolling up */
      props.setShowTopBtn(true);
    }

    lastScroll.current = currentScroll;
  };

  const onClickCategory = (i) => {
    if (categorySelectionIndex === i) setCategorySelectionIndex(null);
    else setCategorySelectionIndex(i);
  };

  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-around w-full md:w-3/4 lg:w-4/6 xl:w-1/2 border-b-2 pt-6 pb-4 mb-2">
          <button onClick={(e) => categoriesFilter(null)} className="btn-standard">
            All
          </button>
          <button onClick={(e) => categoriesFilter(e.target.innerText)} className="btn-standard">
            Food
          </button>
          <button onClick={(e) => categoriesFilter(e.target.innerText)} className="btn-standard">
            Drinks
          </button>
          <button onClick={(e) => categoriesFilter(e.target.innerText)} className="btn-standard">
            School
          </button>
          <button onClick={(e) => categoriesFilter(e.target.innerText)} className="btn-standard">
            Cleaning
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative flex-col w-full md:w-3/4 lg:w-4/6 xl:w-1/2">
          {Array.isArray(categoryList) &&
            categoryList.length > 0 &&
            categoryList.map((category, i) => {
              return (
                <Category
                  key={i}
                  index={i}
                  category={category}
                  isActive={categorySelectionIndex === i}
                  onClick={onClickCategory}
                />
              );
            })}
        </div>
      </div>
      <div
        className={
          "absolute left-1/2 transform -translate-x-1/2 mt-10 overflow-hidden" + (isEndOfCategories ? " hidden" : "")
        }
      >
        <button
          onClick={() => setFetchingCategoryList(true)}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow"
        >
          Load more?
        </button>
      </div>
    </>
  );
};

export default CatalogueCategories;
