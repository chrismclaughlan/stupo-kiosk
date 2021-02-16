import { useState, useEffect, useRef } from "react";
import Search from "./Components/Search";

import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

import Catalogue from "./Components/Catalogue/Catalogue";
import Checkout from "./Components/Checkout/Checkout";
import OrderConfirmed from "./Components/OrderConfirmed";
import PrivacyPolicy from "./Components/Legal/PrivacyPolicy";
import TermsAndConditions from "./Components/Legal/TermsAndConditions";

function App() {
  const [errorMsg, setErrorMsg] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const helpMenuRef = useRef(null);

  /* Search bar */
  const [searchString, setSearchString] = useState("");
  const [searchingFor, setSearchingFor] = useState(null);
  const [hideSuggestions, setHideSuggestions] = useState(true);
  const searchFocusRef = useRef(null);

  /* Basket */
  const [basketList, setBasketList] = useState(() => 
    JSON.parse(localStorage.getItem("basketList")) || []
  );
  const [showBasket, setShowBasket] = useState(false);
  const [animateBasket, setAnimateBasket] = useState(0);

  useEffect(() => {
    localStorage.setItem("basketList", JSON.stringify(basketList));
  }, [basketList]);

  /* Catalogue */
  const [isEndOfCategories, setIsEndOfCategories] = useState(false);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [fetchingCategoryList, setFetchingCategoryList] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [filter, setFilter] = useState(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  //   listofcategories.slice(0, 10)
  // );

  useEffect(() => {
    if (!searchingFor) return;

    fetchProducts();
  }, [searchingFor]);

  async function fetchProducts() {
    if (searchingFor == null) return;

    fetch(`/api/catalogue/categories/${searchingFor}/products`)
      .then((res) => res.json())
      .then((results) => {
        if (!Array.isArray(results) || results.length === 0)
          return;

        setProductList(results); // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
      })
      .catch((error) => {
        console.error(`error: ${error}`)
        setErrorMsg(`Error fetching product: ${error}`)
      });

    setSearchingFor(null);
  }

  function categoriesFilter(newFilter) {
    setFilter(newFilter);
    setCategoryList([]);
    setCategoriesPage(1);
    setIsEndOfCategories(false);
    setFetchingCategoryList(true);
  }

  async function fetchCategoryList() {
    if (isEndOfCategories || searchingFor != null) return;

    const queryFilter = filter == null ? "" : `&search=${filter}`;
    fetch(`/api/catalogue/categories?page=${categoriesPage}&per_page=10${queryFilter}`)
      .then((res) => res.json())
      .then((results) => {
        if (!Array.isArray(results) || results.length === 0) {
          return setIsEndOfCategories(true);
        }

        setCategoryList([...categoryList, ...results]);
        setCategoriesPage(categoriesPage + 1);
      })
      .catch((error) => {
        console.error(`error: ${error}`)
        setErrorMsg(`Error fetching categories: ${error}`)
      });

    setFetchingCategoryList(false);
  }

  useEffect(() => {
    if (!fetchingCategoryList) return;
    return fetchCategoryList();
  }, [fetchingCategoryList]);

  function basketProductGetIndex(product) {
    var i;
    var found = false;
    for (i = 0; i < basketList.length; i++) {
      if (basketList[i].id === product.id) {
        found = true;
        break;
      }
    }

    if (found) {
      return i;
    } else {
      return -1;
    }
  }

  function basketProductAdd(product) {
    let index = basketProductGetIndex(product);

    if (index >= 0) {
      /* Product already in basket */
      let newBasketList = [...basketList];
      newBasketList[index].quantityInBasket += 1;
      setBasketList(newBasketList);
    } else {
      /* Product not in basket */
      product.quantityInBasket = 1;
      setBasketList((old) => [...old, product]);
    }

    setAnimateBasket(1);
  }

  function getBasketTotalQuantity() {
    let total = 0;

    for (var i = 0; i < basketList.length; i++) {
      total += basketList[i].quantityInBasket;
    }

    return total;
  }

  function getBasketTotalPrice() {
    let total = 0;

    for (var i = 0; i < basketList.length; i++) {
      total += basketList[i].price * basketList[i].quantityInBasket;
    }

    return total;
  }

  function basketRemove(p) {
    let index = basketProductGetIndex(p);

    if (index >= 0) {
      /* Product already in basket */
      let newBasketList = [...basketList];
      newBasketList.splice(index, 1);
      setBasketList(newBasketList);
    }
  }

  function basketQuantityIncrease(p) {
    let index = basketProductGetIndex(p);

    if (index >= 0) {
      /* Product already in basket */
      let newBasketList = [...basketList];
      newBasketList[index].quantityInBasket += 1;
      setBasketList(newBasketList);
    }
  }

  function basketQuantityDecrease(p) {
    let index = basketProductGetIndex(p);

    if (index >= 0) {
      /* Product already in basket */
      let newBasketList = [...basketList];
      newBasketList[index].quantityInBasket -= 1;

      if (newBasketList[index].quantityInBasket < 1)
        newBasketList[index].quantityInBasket = 1;

      setBasketList(newBasketList);
    }
  }

  function resetEscape() {
    setHideSuggestions(true);
  }

  document.onKeypress = function (e) {
    e = e || window.event;

    if (e.keyCode === 27) {
      resetEscape();
      console.log("escape")
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  });

  function handleClickOutside(e) {
    if (searchFocusRef && searchFocusRef.current && !searchFocusRef.current.contains(e.target))
      setHideSuggestions(true);

    if (helpMenuRef && helpMenuRef.current && !helpMenuRef.current.contains(e.target))
      setShowHelp(false);
  }

  return (
    <BrowserRouter>
      <header className="bg-white p-4 flex justify-between items-center border-b border-grey z-50">
        <div
          className={
            "fixed top-0 left-1/2 rounded-b-lg border-b border-r border-l border-red-700 transition-all transform -translate-x-1/2 z-0 bg-red-200 hover:opacity-100" +
            (errorMsg.length > 0 ? " opacity-100 translate-y-24" : " opacity-0")
          }
        >
          <div className="relative py-4 px-10">
            {errorMsg}
            <div
              onClick={() => setErrorMsg("")}
              className="absolute top-0 -right-3 w-9 cursor-pointer"
            >
              x
            </div>
          </div>
        </div>

        <div className="ml-0 sm:ml-6">
          <Link
            onClick={() => {
              setProductList([])
              setFilter(null);
              setShowBasket(false);
              setShowHelp(false);
              setHideSuggestions(true);
              window.scrollTo(0, 0);
              setShowTopBtn(false);
              categoriesFilter(null);
            }}
            to="/"
            className="flex items-center space-x-4"
          >
            <div className="inline-block w-10 sm:w-auto font-thin text-2xl">StuPo Kiosk</div>
            <img
              className="inline-block mr-3 hidden sm:block rounded w-16"
              src="stupokiosk-tree.png"
              alt="Site Logo"
            ></img>
          </Link>
        </div>

        <Search
          searchFocusRef={searchFocusRef}
          hideSuggestions={hideSuggestions}
          setHideSuggestions={setHideSuggestions}
          setErrorMsg={setErrorMsg}
          searchString={searchString}
          setSearchString={setSearchString}
          list={categoryList}
          searchingFor={searchingFor}
          setSearchingFor={setSearchingFor}
        />

        <div className="flex items-center mr-0 sm:mr-6 sm:space-x-4">
          {/* <div className="inline-block z-10">
            <img
              className="w-6"
              alt=""
              src="https://cdn1.iconfinder.com/data/icons/freeline/32/account_friend_human_man_member_person_profile_user_users-256.png"
            ></img>
          </div> */}

          <div className={"fixed p-0 m-0 top-0 left-0 w-full h-full bg-black transition-all" + (showHelp ? " opacity-20" : " opacity-0 no-click")}></div>


          <div
            onClick={() => setShowBasket(!showBasket)}
            className="flex items-center space-x-1 mr-2 inline-block z-10 cursor-pointer"
          >
            <img
              className="inline-block w-6 basket-animation"
              onAnimationEnd={() => setAnimateBasket(0)}
              animate={animateBasket}
              alt=""
              src="https://cdn0.iconfinder.com/data/icons/elasto-online-store/26/00-ELASTOFONT-STORE-READY_bag-256.png"
            ></img>
            <div className="inline-block px-0">{getBasketTotalQuantity()}</div>
          </div>

          <div ref={helpMenuRef} className="relative inline-block z-10">
            <img
              onClick={() => setShowHelp(!showHelp)}
              className="w-6 cursor-pointer"
              alt=""
              src="https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/help-256.png"
            ></img>

            <div className={"absolute bg-white right-0 top-full w-52 my-1 shadow border border-gray-300 transition-all z-50" + (showHelp ? " opacity-100" : " transform translate-x-full opacity-0")}>
              <Link onClick={() => setShowHelp(false)} to="/who-are-we" className="block py-2 px-4 hover:bg-gray-200">Who Are We?</Link>
              <Link onClick={() => setShowHelp(false)} to="/contact-us" className="block py-2 px-4 hover:bg-gray-200">Contact Us</Link>
              <Link onClick={() => setShowHelp(false)} to="/privacy-policy" className="block py-2 px-4 hover:bg-gray-200">Privacy Policy</Link>
              <Link onClick={() => setShowHelp(false)} to="/terms-and-conditions" className="block py-2 px-4 hover:bg-gray-200">Terms and Conditions</Link>
            </div>
          </div>

          <div
            className={
              "fixed flex flex-col justify-between pt-5 sm:pt-24 bg-white border-l-2 w-full sm:w-96 h-screen top-0 right-0 z-0 transition-all" +
              (!showBasket ? " transform translate-x-96 opacity-0" : "")
            }
          >
            <div className="overflow-auto">
              <div className="overflow-none w-full border-b-2 px-10 py-4 text-lg font-medium">
                Basket
              </div>
              <div className="mt-4">
                {basketList && basketList.length === 0 && (
                  <div className="w-full px-10 py-2">
                    <div className="relative text-lg">
                      <div>Your basket is empty</div>
                    </div>
                  </div>
                )}
                {basketList &&
                  basketList.map((product, i) => {
                    return (
                      <div key={i} className="w-full px-10 py-2 border-b">
                        <div className="relative text-lg">
                          <div>{product.name}</div>
                          <div
                            onClick={() => basketRemove(product)}
                            className="absolute -right-7 -top-0.5 w-9 cursor-pointer font-light"
                          >
                            x
                          </div>
                        </div>
                        <div className="flex justify-between text-lg font-light pt-2">
                          <div className="flex space-x-4">
                            <div className="inline">
                              Quantity: {product.quantityInBasket}
                            </div>
                            <div>
                              <button
                                onClick={() => basketQuantityDecrease(product)}
                                className="inline px-2.5 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <button
                                onClick={() => basketQuantityIncrease(product)}
                                className="inline px-2.5 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>€{product.price}</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="px-10 pb-10 pt-5 border-t-2">
              <div className="flex justify-between text-lg font-medium">
                <div>Total</div>
                <div>€{getBasketTotalPrice().toFixed(2)}</div>
              </div>
              <Link to="/order-checkout">
                <button className="mt-4 py-4 w-full bg-theme-2-300">
                  Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <img
        className="background"
        src="stupokiosk-background-phone.png"
        srcSet={
          "stupokiosk-background-phone.png 512w, stupokiosk-background.png 768w, stupokiosk-background-high-res.png 2000w"
        }
        alt="Background"
      ></img>

      <div className={"pt-28 transition-all" + (showBasket ? " sm:mr-96" : "")}>
        <Switch>
          <Route exact path="/">
            <Catalogue
              showTopBtn={showTopBtn}
              setShowTopBtn={setShowTopBtn}
              categoriesFilter={categoriesFilter}
              productList={productList}
              setProductList={setProductList}
              isEndOfCategories={isEndOfCategories}
              setErrorMsg={setErrorMsg}
              categoryList={categoryList}
              addToBasketCallback={basketProductAdd}
              setFetchingCategoryList={setFetchingCategoryList}
            />
          </Route>

          <Route path="/privacy-policy">
            <PrivacyPolicy />
          </Route>

          <Route path="/terms-and-conditions">
            <TermsAndConditions />
          </Route>

          <Route path="/order-checkout">
            <Checkout
              setErrorMsg={setErrorMsg}
              setShowBasket={setShowBasket}
              basketList={basketList}
              setBasketList={setBasketList}
              getBasketTotalPrice={getBasketTotalPrice}
              basketRemove={basketRemove}
              basketQuantityIncrease={basketQuantityIncrease}
              basketQuantityDecrease={basketQuantityDecrease}
            />
          </Route>

          <Route path="/order-confirmed">
            <OrderConfirmed
              setErrorMsg={setErrorMsg}
              setShowBasket={setShowBasket}
            />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
