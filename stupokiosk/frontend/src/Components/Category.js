import Product from "./Product";

export default function Category(props) {
  return (
    <div className="py-1">
      <div
        className={
          "bg-white shadow cursor-pointer z-10 mt-4 p-4 border-solid border-2 border-theme-1-100 hover:bg-theme-3-200 hover:shadow z-10 select-none category-item group" +
          (props.isActive ? " bg-theme-3-200" : "")
        }
        onClick={() => props.onClick(props.index)}
      >
        <img
          width="70px"
          className="float-left mr-4"
          src={props.category.image}
          alt={"Picture of " + props.category.name}
        ></img>
        <div className="font-bold">{props.category.name}</div>
        <div className="font-thin">{props.category.description}</div>
        <img
          className={"float-right w-6 opacity-20 group-hover:opacity-70" + (props.isActive ? " opacity-40" : "")}
          src="https://cdn0.iconfinder.com/data/icons/arrows-android-l-lollipop-icon-pack/24/expand2-256.png"
          alt="Expand category"
        ></img>
        <br></br>
      </div>

      {props.isActive &&
        props.category.products.map((product, i) => {
          return (
            <Product
              key={i}
              index={i}
              product={product}
              onClick={props.addToBasketCallback}
              extraStyling={"active:bg-theme-3-200 hover:bg-theme-3-100"}
              iconSrc={"https://cdn0.iconfinder.com/data/icons/elasto-online-store/26/00-ELASTOFONT-STORE-READY_bag-256.png"}
            />
          );
        })}
    </div>
  );
}
