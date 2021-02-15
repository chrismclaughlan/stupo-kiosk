import React from "react";
import isMobilePhone from "validator/es/lib/isMobilePhone";
import Product from "../Product";

const MAX_FORM_FIELD_LENGTH = 30;

export default function CheckoutTotal(props) {
  // TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
  function isFormNameValid() {
    return props.formName.length > 1;
  }

  function isFormAddressValid() {
    return props.formAddress.length > 1;
  }

  function isFormPhoneValid() {
    return props.formPhone.length > 1 && isMobilePhone(props.formPhone);
  }

  function isBasketValid() {
    return props.basketList.length !== 0;
  }

  function changePage(p) {
    /* Check forms are valid */

    if (!isFormNameValid()) props.setErrorMsg("Invalid Name");
    else if (!isFormAddressValid()) props.setErrorMsg("Invalid Address");
    else if (!isFormPhoneValid()) props.setErrorMsg("Invalid Phone");
    else if (!isBasketValid()) props.setErrorMsg("Basket is empty");
    else {
      props.setErrorMsg("");
      props.setPage(p);
    }
  }

  function changeFormField(value, target) {
    if (value.length > MAX_FORM_FIELD_LENGTH) return;

    switch (target) {
      case "name":
        props.setFormName(value);
        break;
      case "address":
        props.setFormAddress(value);
        break;
      case "phone":
        {
          value = value.trim();

          if (value.length >= 1 && value[0] !== "+") {
            value = "+" + value;
          }

          props.setFormPhone(value);
        }
        break;
      case "comment":
        props.setFormComment(value);
        break;
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    changePage("total-leave"); // payment
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-row w-screen sm:w-2/3">
        <div className="flex-grow w-full md:w-3/4 lg:w-4/6 xl:w-1/2 mt-20">
          {props.basketList.map((product, i) => {
            return (
              <div key={i} className="flex items-center select-none">
                <div className="relative flex items-center justify-center flex-grow-0 w-10 h-10 inline border border-gray-300 bg-gray-200 rounded-full mt-1 py-2">
                  <div className="text-center">{product.quantityInBasket}x</div>
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
                    className="flex shadow border border-gray-300 items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                  >
                    -
                  </div>
                  <div
                    onClick={() => props.basketQuantityIncrease(product)}
                    className="flex shadow border border-gray-300 items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 cursor-pointer"
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
                  value={props.formName}
                  onChange={(e) => changeFormField(e.target.value, "name")}
                  type="text"
                  className={
                    "w-full px-4 py-2 focus:outline-none focus:white border" +
                    (!isFormNameValid()
                      ? " border-red-500"
                      : " border-black bg-gray-50")
                  }
                  placeholder="Name"
                />
              </div>
              <input
                required
                value={props.formAddress}
                onChange={(e) => changeFormField(e.target.value, "address")}
                type="text"
                className={
                  "w-full px-4 py-2 focus:outline-none focus:white border" +
                  (!isFormAddressValid()
                    ? " border-red-500"
                    : " border-black bg-gray-50")
                }
                placeholder="Room number (eg KB-123)"
              />
              <input
                required
                value={props.formPhone}
                onChange={(e) => changeFormField(e.target.value, "phone")}
                type="text"
                className={
                  "w-full px-4 py-2 focus:outline-none focus:white border" +
                  (!isFormPhoneValid()
                    ? " border-red-500"
                    : " border-black bg-gray-50")
                }
                placeholder="Phone number (eg +49xxxxxxxxxxx)"
              />
              <input
                type="text"
                value={props.formComment}
                onChange={(e) => changeFormField(e.target.value, "comment")}
                className="border border-gray-500 w-full px-4 py-2 focus:outline-none focus:border-theme-2-400"
                placeholder="Comments (optional)"
              />

              <input
                type="submit"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: "1px",
                  height: "1px",
                }}
                tabIndex="-1"
              ></input>
            </form>
          </div>

          <div className="space-y-4">
            <div className="p-2 border-b-2 font-light">Payment Options</div>

            <button
              onClick={(e) => handleSubmit(e)}
              className="relative text-center w-full bg-theme-2-300 p-4"
            >
              Cash
            </button>
            <button
              onClick={(e) => props.setErrorMsg("Sorry, paypal is not an option yet")} 
              className="relative group text-center w-full bg-gray-200 hover:bg-gray-300 p-4 cursor-not-allowed"
            >
              Paypal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
