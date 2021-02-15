import { Link, useHistory } from "react-router-dom";

export default function CheckoutPayment(props) {
  const history = useHistory();

  function confirmPayment() {
    if (props.basketList.length === 0) return;

    const customerInfo = {
      name: props.formName.trim().toLowerCase(),
      address: props.formAddress.trim().toLowerCase(),
      phone: props.formPhone.trim(),
      comment:
        props.formComment.length === 0
          ? null
          : props.formComment.trim().toLowerCase(),
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
        console.error(`Could not POST order: ${error}`);
        props.setErrorMsg(`Could not POST order: ${error}`);
      });
  }

  function changePage(p) {
    props.setErrorMsg("");
    props.setPage(p);
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
        <div className="text-center -mt-6 text-lg font-medium">
          Are these details correct?
        </div>

        <div className="flex flex-col justify-between space-y-1">
          <div className="flex justify-between">
            <div className="font-medium">Name</div>
            <div>{props.formName}</div>
          </div>
          <div className="flex justify-between">
            <div className="font-medium">Room Number</div>
            <div>{props.formAddress}</div>
          </div>
          <div className="flex justify-between">
            <div className="font-medium">Phone Number</div>
            <div>{props.formPhone}</div>
          </div>
          <div className="flex justify-between">
            <div className="font-medium">Comment</div>
            <div>{props.formComment}</div>
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-1">
          <div className="text-center font-thin text-sm">
            By clicking "Confirm" you are agreeing to the{" "}
            <Link
              to="/privacy-policy"
              target="_blank"
              className="font-medium hover:underline"
            >
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
}
