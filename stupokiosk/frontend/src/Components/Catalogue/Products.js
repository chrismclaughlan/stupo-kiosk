import { useContext } from "react";
import { BasketContext, ItemsContext } from "../Contexts";
import Product from "../Product";

const CatalogueProducts = () => {
  const { basketDispatch } = useContext(BasketContext);
  const { productList } = useContext(ItemsContext);

  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-around w-full md:w-3/4 lg:w-4/6 xl:w-1/2 border-b-2 pt-6 pb-4 mb-2">
          <button className="btn-standard">Reset</button>
          <button className="btn-standard">Sort by Price</button>
          <button className="btn-standard">Sort by Quantity</button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative flex-col w-full md:w-3/4 lg:w-4/6 xl:w-1/2">
          {Array.isArray(productList) &&
            productList.length !== 0 &&
            productList.map((product, i) => {
              return (
                <Product
                  key={i}
                  index={i}
                  product={product}
                  onClick={() => basketDispatch({ type: "add", product })}
                  extraStyling={"active:bg-theme-3-200 hover:bg-theme-3-100"}
                  iconSrc={
                    "https://cdn0.iconfinder.com/data/icons/elasto-online-store/26/00-ELASTOFONT-STORE-READY_bag-256.png"
                  }
                />
              );
            })}
        </div>
      </div>
    </>
  );
};

export default CatalogueProducts;
