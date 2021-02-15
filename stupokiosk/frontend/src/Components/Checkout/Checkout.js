import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import CheckoutTotal from "./Total";
import CheckoutPayment from "./Payment";

export default function Checkout(props) {
  const [page, setPage] = useState("total");

  /* Form */
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formComment, setFormComment] = useState("");

  useEffect(() => {
    props.setShowBasket(false);
  }, [props]);

  useEffect(() => {
    props.setErrorMsg("");

    return () => {
      props.setErrorMsg("");
    };
  }, []);

  function leaveTotal() {
    console.log(`leaveTotal() page=${page}`)
    if (page === "total-leave") {
      setPage("payment")
      console.log("setPage(payment)")
    }
  }

  function leavePayment() {
    console.log(`leavePayment() page=${page}`)
    if (page === "payment-leave") {
      setPage("total")
      console.log("setPage(total)")
    }
  }

  return (
    <div className="relative">
      {
        (page === "total" || page === "total-leave") && 
        <div page={page} onAnimationEnd={() => leaveTotal()} className="page-transition">
          <CheckoutTotal
            page={page}
            setPage={setPage}
            formName={formName}
            setFormName={setFormName}
            formAddress={formAddress}
            setFormAddress={setFormAddress}
            formPhone={formPhone}
            setFormPhone={setFormPhone}
            formComment={formComment}
            setFormComment={setFormComment}
            basketList={props.basketList}
            basketRemove={props.basketRemove}
            basketQuantityIncrease={props.basketQuantityIncrease}
            basketQuantityDecrease={props.basketQuantityDecrease} 
            getBasketTotalPrice={props.getBasketTotalPrice}
            setErrorMsg={props.setErrorMsg}
          />
        </div>
      }

      {
        (page === "payment" || page === "payment-leave") && 
        <div page={page} onAnimationEnd={() => leavePayment()} className="page-transition">
          <CheckoutPayment
            page={page}
            setPage={setPage}
            formName={formName}
            formAddress={formAddress}
            formPhone={formPhone}
            formComment={formComment}
            basketList={props.basketList}
            setErrorMsg={props.setErrorMsg}
            setBasketList={props.setBasketList}
          />
        </div>
      }
    </div>
  );
}
