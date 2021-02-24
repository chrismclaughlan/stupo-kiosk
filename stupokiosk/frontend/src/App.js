import { useState, useEffect, useRef, useReducer, useCallback, useMemo } from "react";
import Search from "./Components/Search";

import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

import Catalogue from "./Components/Catalogue/Catalogue";
import Checkout from "./Components/Checkout/Checkout";
import OrderConfirmed from "./Components/OrderConfirmed";
import PrivacyPolicy from "./Components/Legal/PrivacyPolicy";
import TermsAndConditions from "./Components/Legal/TermsAndConditions";
import WhoAreWe from "./Components/WhoAreWe";
import ContactUs from "./Components/ContactUs";

import { BasketContext, ItemsContext } from "./Components/Contexts";

const DEFAULT_PER_PAGE = 10;

const getBasketQuantity = (basket) => {
  if (!basket) return 0;

  let total = 0;
  for (var i = 0; i < basket.length; i++) {
    total += basket[i].quantityInBasket;
  }

  return total;
};

const getBasketPrice = (basket) => {
  if (!basket) return 0;

  let total = 0;
  for (var i = 0; i < basket.length; i++) {
    total += basket[i].price * basket[i].quantityInBasket;
  }

  return total;
};

const App = () => {
  /* Header / Misc */
  const [errorMsg, setErrorMsg] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const helpMenuRef = useRef(null);

  /* Search bar */
  const [searchString, setSearchString] = useState("");
  const [searchingFor, setSearchingFor] = useState(null);
  const [hideSuggestions, setHideSuggestions] = useState(true);
  const searchFocusRef = useRef(null);

  /* Basket */
  const [showBasket, setShowBasket] = useState(false);
  const [animateBasket, setAnimateBasket] = useState(0);

  const basketReducer = useCallback(
    (state, action) => {
      const index = state.indexOf(action.product);
      let newState = [];

      switch (action.type) {
        case "empty":
          return [];

        case "remove":
          if (index < 0) return state;

          newState = [...state];
          newState.splice(index, 1); // careful! returns removed elements
          return newState;

        case "add":
          setAnimateBasket(1);

          if (index < 0) {
            let product = action.product;
            product.quantityInBasket = 1;
            return [...state, product];
          }

        /* Product already in basket */
        /* falls through */
        case "increase":
          if (index < 0) return state;

          newState = [...state];
          newState[index].quantityInBasket++;
          return newState;

        case "decrease":
          if (index < 0) return state;

          newState = [...state];
          newState[index].quantityInBasket--;

          if (newState[index].quantityInBasket < 1) newState[index].quantityInBasket = 1;

          return newState;

        default:
          return state;
      }
    },
    [setAnimateBasket]
  );

  const [basketList, basketDispatch] = useReducer(basketReducer, JSON.parse(localStorage.getItem("basketList")) || []);
  const basketQuantity = useMemo(() => getBasketQuantity(basketList), [basketList]);
  const basketPrice = useMemo(() => getBasketPrice(basketList), [basketList]);

  /* Catalogue */
  const [isEndOfCategories, setIsEndOfCategories] = useState(false);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [fetchingCategoryList, setFetchingCategoryList] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [filter, setFilter] = useState(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  document.onKeypress = (e) => {
    e = e || window.event;

    if (e.keyCode === 27) resetEscape();
  };

  const resetEscape = () => {
    setHideSuggestions(true);
  };

  const handleClickOutside = (e) => {
    if (searchFocusRef && searchFocusRef.current && !searchFocusRef.current.contains(e.target))
      setHideSuggestions(true);

    if (helpMenuRef && helpMenuRef.current && !helpMenuRef.current.contains(e.target)) setShowHelp(false);
  };

  const categoriesFilter = (newFilter) => {
    setCategoryList([]);
    setCategoriesPage(1);
    setIsEndOfCategories(false);
    setFilter(newFilter);
  };

  const fetchProducts = useCallback(
    (url) => {
      console.log("fetchProducts");
      fetch(url)
        .then((res) => res.json())
        .then((results) => {
          if (!Array.isArray(results) || results.length === 0) return;

          setProductList(results);
        })
        .catch((error) => {
          console.error(`error: ${error}`);
          setErrorMsg(`Error fetching product: ${error}`);
        });

      setSearchingFor(null);
    },
    [setProductList, setErrorMsg, setSearchingFor]
  );

  const fetchCategoryList = useCallback(
    (url) => {
      fetch(url)
        .then((res) => res.json())
        .then((results) => {
          if (!Array.isArray(results) || results.length === 0) {
            return setIsEndOfCategories(true);
          }

          setCategoryList((prev) => [...prev, ...results]);
          setCategoriesPage((prev) => prev + 1);
        })
        .catch((error) => {
          console.error(`error: ${error}`);
          setErrorMsg(`Error fetching categories: ${error}`);
        });

      setFetchingCategoryList(false);
    },
    [setIsEndOfCategories, setCategoryList, setCategoriesPage, setErrorMsg]
  );

  useEffect(() => {
    localStorage.setItem("basketList", JSON.stringify(basketList));
  }, [basketList]);

  useEffect(() => {
    if (searchingFor == null) return;

    const url = `/api/catalogue/categories/${searchingFor}/products`;
    fetchProducts(url);
  }, [fetchProducts, searchingFor]);

  useEffect(() => {
    setFetchingCategoryList(true);
  }, [filter]);

  useEffect(() => {
    if (!fetchingCategoryList || isEndOfCategories || searchingFor != null) return;

    const queryFilter = filter == null ? "" : `&search=${filter}`;
    const url = `/api/catalogue/categories?page=${categoriesPage}&per_page=${DEFAULT_PER_PAGE}${queryFilter}`;
    fetchCategoryList(url);
  }, [fetchCategoryList, fetchingCategoryList, isEndOfCategories, searchingFor, categoriesPage, filter]);

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  });

  return (
    <BrowserRouter>
      <header className="fixed bg-white p-4 flex justify-between items-center border-b border-grey z-50">
        <div className="ml-0 sm:ml-6">
          <Link
            onClick={() => {
              setProductList([]);
              setShowBasket(false);
              setShowHelp(false);
              setHideSuggestions(true);
              window.scrollTo(0, 0);
              setShowTopBtn(false);

              if (filter != null) {
                setFilter(null);
                categoriesFilter(null);
              }
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

          <div
            className={
              "fixed p-0 m-0 top-0 left-0 w-full h-full bg-black transition-all" +
              (showHelp ? " opacity-20" : " opacity-0 no-click")
            }
          ></div>

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
            <div className="inline-block px-0">{basketQuantity}</div>
          </div>

          <div ref={helpMenuRef} className="relative inline-block z-10">
            <img
              onClick={() => setShowHelp(!showHelp)}
              className="w-6 cursor-pointer"
              alt=""
              src="https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/help-256.png"
            ></img>

            <div
              className={
                "absolute bg-white right-0 top-full w-52 my-1 shadow border border-gray-300 transition-all z-50" +
                (showHelp ? " opacity-100" : " transform translate-x-100 overflow-hidden opacity-50")
              }
            >
              <Link onClick={() => setShowHelp(false)} to="/who-are-we" className="block py-2 px-4 hover:bg-gray-200">
                Who Are We?
              </Link>
              <Link onClick={() => setShowHelp(false)} to="/contact-us" className="block py-2 px-4 hover:bg-gray-200">
                Contact Us
              </Link>
              <Link
                onClick={() => setShowHelp(false)}
                to="/privacy-policy"
                className="block py-2 px-4 hover:bg-gray-200"
              >
                Privacy Policy
              </Link>
              <Link
                onClick={() => setShowHelp(false)}
                to="/terms-and-conditions"
                className="block py-2 px-4 hover:bg-gray-200"
              >
                Terms and Conditions
              </Link>
            </div>
          </div>

          <div
            className={
              "fixed flex flex-col justify-between pt-5 sm:pt-24 bg-white border-l-2 w-full sm:w-96 h-screen top-0 right-0 z-0 transition-all" +
              (!showBasket ? " transform translate-x-96 opacity-0" : "")
            }
          >
            <div className="overflow-auto">
              <div className="overflow-none w-full border-b-2 px-10 py-4 text-lg font-medium">Basket</div>
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
                            onClick={() => basketDispatch({ type: "remove", product })}
                            className="absolute -right-7 px-2.5 -top-0.5 w-9 cursor-pointer font-light"
                          >
                            x
                          </div>
                        </div>
                        <div className="flex justify-between text-lg font-light pt-2">
                          <div className="flex space-x-4">
                            <div className="inline">Quantity: {product.quantityInBasket}</div>
                            <div>
                              <button
                                onClick={() => basketDispatch({ type: "decrease", product })}
                                className="inline px-2.5 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <button
                                onClick={() => basketDispatch({ type: "increase", product })}
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
                <div>€{basketPrice.toFixed(2)}</div>
              </div>
              <Link to="/order-checkout">
                <button className="mt-4 py-4 w-full bg-theme-2-300">Checkout</button>
              </Link>
            </div>
          </div>
        </div>
        {/* <div className={"fixed left-0 bottom-0 w-screen text-center" + (errorMsg.length === 0 ? " hidden" : "")}>
          <div className="py-4 px-10 border-t border-red-700 z-0 bg-red-200" onClick={() => setErrorMsg("")}>
            {errorMsg}
            <div
              onClick={() => setErrorMsg("")}
              className="absolute top-1 right-1 w-10 h-10 cursor-pointer text-lg font-medium"
            >
              x
            </div>
          </div>
        </div> */}
      </header>

      <div
        className={"fixed z-30 w-screen text-center top-24 cursor-pointer" + (errorMsg.length === 0 ? " hidden" : "")}
      >
        <div className="bg-red-200 py-1" onClick={() => setErrorMsg("")}>
          {errorMsg} <div className="inline text-xs font-light">(Click to disappear)</div>
        </div>
        <div
          onClick={() => setErrorMsg("")}
          className="absolute top-0 right-1 w-10 h-10 cursor-pointer text-lg font-medium"
        >
          x
        </div>
      </div>

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
          <BasketContext.Provider value={{ setShowBasket, basketList, basketDispatch, basketPrice }}>
            <ItemsContext.Provider
              value={{
                productList,
                setProductList,
                categoryList,
                setFetchingCategoryList,
                categoriesFilter,
                isEndOfCategories,
              }}
            >
              <Route exact path="/">
                <Catalogue showTopBtn={showTopBtn} setShowTopBtn={setShowTopBtn} setErrorMsg={setErrorMsg} />
              </Route>
            </ItemsContext.Provider>
            <Route path="/order-checkout">
              <Checkout setErrorMsg={setErrorMsg} />
            </Route>
          </BasketContext.Provider>

          <Route path="/order-confirmed">
            <OrderConfirmed setShowBasket={setShowBasket} />
          </Route>

          {/* Help menu */}
          <Route path="/who-are-we">
            <WhoAreWe />
          </Route>
          <Route path="/contact-us">
            <ContactUs />
          </Route>
          <Route path="/privacy-policy">
            <PrivacyPolicy />
          </Route>
          <Route path="/terms-and-conditions">
            <TermsAndConditions />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default App;
