import { useState, useEffect, useContext, useReducer } from "react";
import CheckoutTotal from "./Total";
import CheckoutPayment from "./Payment";
import { BasketContext } from "../Contexts";
//import isMobilePhone from "validator/es/lib/isMobilePhone";

const FIELD_MAX_LENGTH = 30;
const FIELD_MIN_LENGTH = 2;
const PHONE_MIN_LENGTH = 7;

const formReducer = (state, action) => {
  if (action.value.length > FIELD_MAX_LENGTH) return state;

  switch (action.type) {
    case "name":
      return {
        ...state,
        name: {
          value: action.value,
          valid: action.value.trim().length >= FIELD_MIN_LENGTH,
        },
      };
    case "address":
      return {
        ...state,
        address: {
          value: action.value,
          valid: action.value.trim().length >= FIELD_MIN_LENGTH,
        },
      };
    case "phone":
      return {
        ...state,
        phone: {
          value: action.value,
          valid: action.value.trim().length >= PHONE_MIN_LENGTH, //isMobilePhone(phone + ""),
        },
      };
    case "comment":
      return {
        ...state,
        comment: {
          value: action.value,
          valid: action.value.trim().length > 0, // Because optional
        },
      };

    default:
      return state;
  }
};

const Checkout = ({ setErrorMsg }) => {
  const basket = useContext(BasketContext);

  const [page, setPage] = useState("total");

  /* Form TODO formix? */
  // const [formName, setFormName] = useState("");
  // const [formAddress, setFormAddress] = useState("");
  // const [formPhone, setFormPhone] = useState("");
  // const [formComment, setFormComment] = useState("");

  const [form, formDispatch] = useReducer(formReducer, {
    name: { value: "", valid: false },
    address: { value: "", valid: false },
    phone: { value: "", valid: false },
    comment: { value: "", valid: false },
  });

  useEffect(() => {
    basket.setShowBasket(false);
  }, [basket]);

  /* Clear error message on mount and unmount */
  useEffect(() => {
    setErrorMsg("");

    return () => {
      setErrorMsg("");
    };
  }, [setErrorMsg]);

  const leaveTotal = () => {
    if (page === "total-leave") setPage("payment");
  };

  const leavePayment = () => {
    if (page === "payment-leave") setPage("total");
  };

  return (
    <div className="relative">
      {(page === "total" || page === "total-leave") && (
        <div
          page={page}
          onAnimationEnd={() => leaveTotal()}
          className="page-transition"
        >
          <CheckoutTotal
            setPage={setPage}
            setErrorMsg={setErrorMsg}
            form={form}
            formDispatch={formDispatch}
          />
        </div>
      )}

      {(page === "payment" || page === "payment-leave") && (
        <div
          page={page}
          onAnimationEnd={() => leavePayment()}
          className="page-transition"
        >
          <CheckoutPayment
            setPage={setPage}
            setErrorMsg={setErrorMsg}
            form={form}
          />
        </div>
      )}
    </div>
  );
};

export default Checkout;
