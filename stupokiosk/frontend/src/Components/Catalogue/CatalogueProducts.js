import Product from '../Product'

export default function CatalogueProducts(props) {

    console.log(props.productsList)

  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-around w-full md:w-3/4 lg:w-4/6 xl:w-1/2 border-b-2 pt-6 pb-4 mb-2">
          <button className="btn-standard">Food</button>
          <button className="btn-standard">Snacks</button>
          <button className="btn-standard">Toiletries</button>
          <button className="btn-standard">Soft Drinks</button>
          <button className="btn-standard">Alcoholic Drinks</button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative flex-col w-full md:w-3/4 lg:w-4/6 xl:w-1/2">
          {(Array.isArray(props.productList) && props.productList.length !== 0) &&
            props.productList.map((product, i) => {
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
      </div>
    </>
  );
}
