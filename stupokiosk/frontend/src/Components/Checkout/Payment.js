import { useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { BasketContext } from "../Contexts";

const CheckoutPayment = ({ setPage, setErrorMsg, form }) => {
  const { basketList, basketDispatch } = useContext(BasketContext);
  const history = useHistory();

  const confirmPayment = () => {
    if (basketList.length === 0) return;

    const customerInfo = {
      name: form.name.value.trim().toLowerCase(),
      address: form.address.value.trim().toLowerCase(),
      phone: form.phone.value.trim(),
      comment: form.comment.valid ? form.comment.value.trim().toLowerCase() : null,
    };
    const items = basketList.map((product) => {
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
          basketDispatch({ type: "empty" });
          history.push("/order-confirmed");
        }
      })
      .catch((error) => {
        console.error(`Could not POST order: ${error}`);
        setErrorMsg(`Could not POST order: ${error}`);
      });
  };

  function changePage(p) {
    setErrorMsg("");
    setPage(p);
  }

  return (
    <div className="flex justify-center mt-20">
      <div className="relative bg-white border-2 h-auto p-4">
        <button
          onClick={() => changePage("payment-leave")}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow"
        >
          Back
        </button>

        <div className="px-20 space-y-6">
          <div className="text-center -mt-6 text-lg font-medium">Are these details correct?</div>

          <div className="flex flex-col justify-between space-y-1">
            <div className="flex justify-between">
              <div className="font-medium">Name</div>
              <div>{form.name.value}</div>
            </div>
            <div className="flex justify-between">
              <div className="font-medium">Room Number</div>
              <div>{form.address.value}</div>
            </div>
            <div className="flex justify-between">
              <div className="font-medium">Phone Number</div>
              <div>{form.phone.value}</div>
            </div>
            <div className="flex justify-between">
              <div className="font-medium">Comment</div>
              <div>{form.comment.value}</div>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-1">
            <div className="text-center font-thin text-sm">
              By clicking "Confirm" you are agreeing to the{" "}
              <Link to="/privacy-policy" target="_blank" className="font-medium hover:underline">
                privacy policy
              </Link>
            </div>

            <button
              onClick={() => confirmPayment()}
              className="bg-theme-2-300 hover:bg-theme-2-400 font-semibold py-1 px-3 border border-theme-2-400 rounded shadow focus:outline-none transform active:scale-105"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;
