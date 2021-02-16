import { useState, useEffect } from "react";
import Category from "../Category";

export default function CatalogueCategories(props) {
  const [categorySelectionIndex, setCategorySelectionIndex] = useState(null);

  var lastScroll = 0;

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  function handleScroll() {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      props.setFetchingCategoryList(true);
    }

    let currentScroll = document.documentElement.scrollTop;
    if (lastScroll > 0) {
      if (currentScroll > lastScroll || currentScroll < 100) {
        /* Scrolling down */
        props.setShowTopBtn(false);
      } else {
        /* Scrolling up */
        props.setShowTopBtn(true);
      }
    }

    lastScroll = currentScroll;
  }

  function onClickCategory(i) {
    if (categorySelectionIndex === i) {
      setCategorySelectionIndex(null);
    } else {
      setCategorySelectionIndex(i);
    }
  }

  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-around w-full md:w-3/4 lg:w-4/6 xl:w-1/2 border-b-2 pt-6 pb-4 mb-2">
          <button onClick={(e) => props.categoriesFilter(null)} className="btn-standard">All</button>
          <button onClick={(e) => props.categoriesFilter(e.target.innerText)} className="btn-standard">Food</button>
          <button onClick={(e) => props.categoriesFilter(e.target.innerText)} className="btn-standard">Drinks</button>
          <button onClick={(e) => props.categoriesFilter(e.target.innerText)} className="btn-standard">School</button>
          <button onClick={(e) => props.categoriesFilter(e.target.innerText)} className="btn-standard">Cleaning</button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative flex-col w-full md:w-3/4 lg:w-4/6 xl:w-1/2">
          {Array.isArray(props.categoryList) &&
            props.categoryList.length > 0 &&
            props.categoryList.map((category, i) => {
              return (
                <Category
                  key={i}
                  index={i}
                  category={category}
                  isActive={categorySelectionIndex === i}
                  onClick={onClickCategory}
                  addToBasketCallback={props.addToBasketCallback}
                />
              );
            })}
        </div>
      </div>
      <div
        className={
          "absolute left-1/2 transform -translate-x-1/2 mt-10 overflow-hidden" +
          (props.isEndOfCategories ? " hidden" : "")
        }
      >
        <button
          onClick={() => props.setFetchingCategoryList(true)}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow"
        >
          Load more?
        </button>
      </div>
    </>
  );
}
