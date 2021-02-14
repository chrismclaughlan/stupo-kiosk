import { useState } from "react";

export default function Product(props) {
  const [animate, setAnimate] = useState(0);

  function productClick() {
    setAnimate(0);
    props.onClick(props.product);
    setAnimate(1);
  }

  return (
    <div
      className={
        "bg-white shadow group product cursor-pointer z-0 mx-5 my-2 p-2 border-solid border-2 border-blue-100 hover:shadow z-0 select-none " +
        props.extraStyling
      }
      style={{
        animation: `${
          props.index * 0.1
        }s ease-out 0s 1 slideInFromAboveAnimation`,
      }}
      onClick={() => productClick()}
    >
      <img
        width="50px"
        className="float-left mr-4"
        src={props.product.image}
        alt={"Picture of " + props.product.name}
      ></img>
      <div className="float-right">€{props.product.price.toFixed(2)}</div>
      <div>{props.product.name}</div>
      <img
        className="float-right w-6 opacity-20 group-hover:opacity-60 product-basket-animation"
        src={props.iconSrc}
        alt="What happens when I press on product"
        onAnimationEnd={() => setAnimate(0)}
        animate={animate}
      ></img>
      <br></br>
    </div>
  );
}
