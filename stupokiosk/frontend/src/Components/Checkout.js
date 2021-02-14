import { useState, useEffect } from "react";
import isMobilePhone from "validator/es/lib/isMobilePhone";
import Product from "./Product";
import { Link, useHistory } from "react-router-dom";

const MAX_FORM_FIELD_LENGTH = 30;

export default function Checkout(props) {
  const history = useHistory();

  const [page, setPage] = useState("total");

  /* Form */
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formPrivacy, setFormPrivacy] = useState(false);
  /**
   * If user tries to submit form without checking privacy notice,
   * inform requirement through styling (eg. color: red;).
   */
  const [formPrivacyPrompt, setFormPrivacyPrompt] = useState(false);

  useEffect(() => {
    props.setShowBasket(false);
  }, [props]);

  useEffect(() => {
    props.setErrorMsg("")

    return () => {
      props.setErrorMsg("")
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
  }

  function changeFormField(value, target) {
    if (value.length > MAX_FORM_FIELD_LENGTH) return;

    switch(target) {
      case "name":
        setFormName(value);
        break;
      case "address":
        setFormAddress(value);
        break;
      case "phone": {
        value = value.trim();

        if (value.length >= 1 && value[0] !== "+") {
          value = "+" + value;
        }
    
        setFormPhone(value)
      } break;
      case "comment":
        setFormComment(value);
        break;
    }
  }

  // TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
  function isFormNameValid() {
    return formName.length > 1;
  }

  function isFormAddressValid() {
    return formAddress.length > 1;
  }

  function isFormPhoneValid() {
    return formPhone.length > 1 && isMobilePhone(formPhone);
  }

  function isBasketValid() {
    return props.basketList.length !== 0;
  }

  /* TODO change name make clear which page */
  function changePage(p) {
    if (page === "total" && p === "payment") {
      /* Check forms are valid */

      if (!isFormNameValid())
        props.setErrorMsg("Invalid Name");
      else if (!isFormAddressValid())
        props.setErrorMsg("Invalid Address");
      else if (!isFormPhoneValid())
        props.setErrorMsg("Invalid Phone");
      else if (!isBasketValid())
        props.setErrorMsg("Basket is empty");
      else {
        props.setErrorMsg("");
        setPage(p);
      }

    } else if (page === "payment" && p === "total") {
      /* Allow switch */
      props.setErrorMsg("");
      setPage(p);
    }
  }

  function confirmPayment() {
    if (props.basketList.length === 0) return;

    if (!formPrivacy) {
      props.setErrorMsg("Please agree to the privacy policy to confirm purchase")
      setFormPrivacyPrompt(true);
      return;
    }
    setFormPrivacyPrompt(false);

    const customerInfo = {
      name: formName.trim().toLowerCase(),
      address: formAddress.trim().toLowerCase(),
      phone: formPhone.trim(),
      comment: formComment.length === 0 ? null : formComment.trim().toLowerCase(),
    };
    const items = props.basketList.map((product) => {
      return {
        productID: product.id,
        productQuantity: product.quantityInBasket,
      };
    });

    fetch("/api/orders", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerInfo,
        paymentMethod: "cash",
        items,
      }),
    })
    .then((result) => {
      if (result.status === 200) {
        props.setBasketList([]);
        history.push("/order-confirmed");
      }
    })
    .catch((error) => {
      console.error(`Could not POST order: Status ${error.status}`)
      props.setErrorMsg(`Could not POST order: Status ${error.status}`)
    });
  }

  return (
    <>
      <div
        className={
          "flex justify-center transition-all duration-500" +
          (page !== "total"
            ? " transform -translate-x-full opacity-0"
            : " transform-none opacity-100")
        }
      >
        <div className="flex flex-row w-screen sm:w-2/3">
          <div className="flex-grow w-full md:w-3/4 lg:w-4/6 xl:w-1/2 mt-20">
            {props.basketList.map((product, i) => {
              return (
                <div key={i} className="flex items-center select-none">
                  <div className="relative flex items-center justify-center flex-grow-0 w-10 h-10 inline bg-theme-1-50 rounded-full mt-1 py-2">
                    <div className="text-center">
                      {product.quantityInBasket}x
                    </div>
                  </div>

                  <div className="flex-grow inline">
                    <Product
                      index={i}
                      product={product}
                      onClick={props.basketRemove}
                      extraStyling={"active:bg-red-200 hover:bg-red-100"}
                      iconSrc={
                        "https://cdn1.iconfinder.com/data/icons/feather-2/24/trash-2-256.png"
                      }
                    />
                  </div>

                  <div className="flex space-x-2">
                    <div
                      onClick={() => props.basketQuantityDecrease(product)}
                      className="flex shadow items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    >
                      -
                    </div>
                    <div
                      onClick={() => props.basketQuantityIncrease(product)}
                      className="flex shadow items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    >
                      +
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/** TODO place total at bottom fixed for mobiles */}

          <div className="flex flex-col max-h-125 justify-between flex-grow-0 h-full w-96 p-4 mt-16 ml-20 bg-white border border-gray-200 shadow">
            <div className="text-center font-medium text-2xl p-3 border-b-2">
              Checkout Total
            </div>
            <div
              className={
                "text-center font-normal text-6xl" +
                (props.basketList.length === 0 ? " text-red-400" : "")
              }
            >
              €{props.getBasketTotalPrice().toFixed(2)}
            </div>

            <div className="space-y-4">
              <div className="p-2 border-b-2 font-light">Delivery</div>
              <form className="space-y-2" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    required
                    value={formName}
                    onChange={(e) => changeFormField(e.target.value, "name")}
                    type="text"
                    className={"w-full px-4 py-2 focus:outline-none focus:white border" + (!isFormNameValid() ? " border-red-500" : " border-black bg-gray-50")}
                    placeholder="Name"
                  />
                </div>
                <input
                  required
                  value={formAddress}
                  onChange={(e) => changeFormField(e.target.value, "address")}
                  type="text"
                  className={"w-full px-4 py-2 focus:outline-none focus:white border" + (!isFormAddressValid() ? " border-red-500" : " border-black bg-gray-50")}
                  placeholder="Room number (eg KB-123)"
                />
                <input
                  required
                  value={formPhone}
                  onChange={(e) => changeFormField(e.target.value, "phone")}
                  type="text"
                  className={"w-full px-4 py-2 focus:outline-none focus:white border" + (!isFormPhoneValid() ? " border-red-500" : " border-black bg-gray-50")}
                  placeholder="Phone number (eg +49xxxxxxxxxxx)"
                />
                <input
                  type="text"
                  value={formComment}
                  onChange={(e) => changeFormField(e.target.value, "comment")}
                  className="border border-gray-500 w-full px-4 py-2 focus:outline-none focus:border-theme-2-400"
                  placeholder="Comments (optional)"
                />
              </form>
            </div>

            <div className="space-y-4">
              <div className="p-2 border-b-2 font-light">Payment Options</div>

                <button
                  onClick={() => changePage("payment")}
                  className="relative text-center w-full bg-theme-2-300 p-4"
                >
                  Cash
                </button>
                <button
                  onClick={() => changePage("payment")}
                  className="relative group text-center w-full bg-gray-200 hover:bg-gray-300 p-4 cursor-not-allowed"
                >
                  Paypal
                </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={
          "absolute top-1/4 transition-all duration-500" +
          (page !== "payment" ? " -right-full opacity-0" : " right-1/2 opacity-100")
        }
      >
        <div className="relative -right-1/2 bg-white border-2 w-125 h-auto p-4">
          <button
            onClick={() => changePage("total")}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow"
          >
            Back
          </button>

          <div className="text-center p-4 -mt-10 text-lg font-medium">
            Are these details correct?
          </div>

          <div className="flex flex-col justify-between px-20 py-4 space-y-1">
            <div className="flex justify-between">
              <div className="font-medium">Name</div>
              <div>{formName}</div>
            </div>
            <div className="flex justify-between">
              <div className="font-medium">Room Number</div>
              <div>{formAddress}</div>
            </div>
            <div className="flex justify-between">
              <div className="font-medium">Phone Number</div>
              <div>{formPhone}</div>
            </div>
            <div className="flex justify-between">
              <div className="font-medium">Comment</div>
              <div>{formComment}</div>
            </div>

            <form className="flex justify-center items-center">
              <input
                type="checkbox"
                checked={formPrivacy}
                onChange={() => setFormPrivacy(!formPrivacy)}
                className="h-4 w-4 border rounded mr-2"
              ></input>
              <label
                htmlFor="checkbox-example"
                className={
                  "font-thin" +
                  (formPrivacyPrompt ? " text-red-500" : " text-gray-500")
                }
              >
                By clicking "Confirm" you are agreeing to the{" "}
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  className="font-medium hover:underline"
                >
                  privacy policy
                </Link>
              </label>
            </form>

            <button
              onClick={() => confirmPayment()}
              className="bg-white bg-theme-2-300 hover:bg-theme-2-400 font-semibold py-1 px-3 border border-theme-2-400 rounded shadow focus:outline-none transform active:scale-105"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
