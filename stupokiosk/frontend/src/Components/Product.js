const Product = (props) => {
  return (
    <div
      className={
        "flex relative bg-white shadow group product cursor-pointer z-0 mx-5 my-2 p-2 border-solid border-2 border-blue-100 hover:shadow z-0 select-none " +
        props.extraStyling
      }
      style={{
        animation: `${props.index * 0.1}s ease-out 0s 1 slideInFromAboveAnimation`,
      }}
      onClick={() => props.onClick(props.product)}
    >
      <img
        width="50px"
        className="float-left mr-4"
        src={props.product.image}
        alt={"Picture of " + props.product.name}
      ></img>
      <div className="mr-20">{props.product.name}</div>
      <div className="absolute top-1 right-1">
        €{props.product.price.toFixed(2)}
        <div className="inline font-thin lg:hidden">
          {props.showQuantity && props.product.quantityInBasket && ` x${props.product.quantityInBasket}`}
        </div>
      </div>
      <img
        className="absolute bottom-1 right-1 w-6 opacity-20 group-hover:opacity-60 "
        src={props.iconSrc}
        alt="What happens when I press on product"
      ></img>
      <div className="font-thin"></div>
    </div>
  );
};

export default Product;
