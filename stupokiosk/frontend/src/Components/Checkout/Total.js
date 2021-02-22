import { useContext } from "react";
import Product from "../Product";
import { BasketContext } from "../Contexts";

/* Fomrix? */
const CheckoutTotal = ({ setPage, setErrorMsg, form, formDispatch }) => {
  const { basketList, basketDispatch, basketPrice } = useContext(BasketContext);

  const changePage = (p) => {
    /* Check forms are valid */

    if (!form.name.valid) setErrorMsg("Invalid Name");
    else if (!form.address.valid) setErrorMsg("Invalid Address");
    else if (!form.phone.valid) setErrorMsg("Invalid Phone");
    else if (basketList.length === 0) setErrorMsg("Basket is empty");
    else {
      setErrorMsg("");
      setPage(p);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    changePage("total-leave"); // payment
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-row w-screen sm:w-2/3">
        <div className="flex-grow w-full md:w-3/4 lg:w-4/6 xl:w-1/2 mt-20">
          {basketList.map((product, i) => {
            return (
              <div key={i} className="flex items-center select-none">
                <div className="relative flex items-center justify-center flex-grow-0 w-10 h-10 inline border border-gray-300 bg-gray-200 rounded-full mt-1 py-2">
                  <div className="text-center">{product.quantityInBasket}x</div>
                </div>

                <div className="flex-grow inline">
                  <Product
                    index={i}
                    product={product}
                    onClick={() => basketDispatch({ type: "remove", product })}
                    extraStyling={"active:bg-red-200 hover:bg-red-100"}
                    iconSrc={
                      "https://cdn1.iconfinder.com/data/icons/feather-2/24/trash-2-256.png"
                    }
                  />
                </div>

                <div className="flex space-x-2">
                  <div
                    onClick={() =>
                      basketDispatch({ type: "decrease", product })
                    }
                    className="flex shadow border border-gray-300 items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                  >
                    -
                  </div>
                  <div
                    onClick={() =>
                      basketDispatch({ type: "increase", product })
                    }
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
              (basketList.length === 0 ? " text-red-400" : "")
            }
          >
            €{basketPrice.toFixed(2)}
          </div>

          <div className="space-y-4">
            <div className="p-2 border-b-2 font-light">Delivery</div>
            <form className="space-y-2" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  required
                  value={form.name.value}
                  onChange={(e) =>
                    formDispatch({ type: "name", value: e.target.value })
                  }
                  type="text"
                  className={
                    "w-full px-4 py-2 focus:outline-none focus:white border" +
                    (!form.name.valid
                      ? " border-red-500"
                      : " border-black bg-gray-50")
                  }
                  placeholder="Name"
                />
              </div>
              <input
                required
                value={form.address.value}
                onChange={(e) =>
                  formDispatch({ type: "address", value: e.target.value })
                }
                type="text"
                className={
                  "w-full px-4 py-2 focus:outline-none focus:white border" +
                  (!form.address.valid
                    ? " border-red-500"
                    : " border-black bg-gray-50")
                }
                placeholder="Room number (eg KB-123)"
              />
              <input
                required
                value={form.phone.value}
                onChange={(e) =>
                  formDispatch({ type: "phone", value: e.target.value })
                }
                type="text"
                className={
                  "w-full px-4 py-2 focus:outline-none focus:white border" +
                  (!form.phone.valid
                    ? " border-red-500"
                    : " border-black bg-gray-50")
                }
                placeholder="Phone number (eg +49xxxxxxxxxxx)"
              />
              <input
                type="text"
                value={form.comment.value}
                onChange={(e) =>
                  formDispatch({ type: "comment", value: e.target.value })
                }
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
              onClick={(e) => setErrorMsg("Sorry, paypal is not an option yet")}
              className="relative group text-center w-full bg-gray-200 hover:bg-gray-300 p-4 cursor-not-allowed"
            >
              Paypal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutTotal;
