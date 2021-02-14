import {useEffect} from "react";
import { Link } from "react-router-dom";

const helpPhoneNumber = "4917664303674";
const helpMessage = "";

/**
 * IDEA: GIF animation of hedgehog pushing trolly -> once here trolly empties and it goes back <-
 */

export default function OrderConfirmed(props) {
  useEffect(() => {
    props.setShowBasket(false);
  }, [props]);

  return (
    <div className="flex flex-col items-center justify-center">
      <img
        className="mt-40 w-72"
        src="https://www.picclickimg.com/d/l400/pict/193637597257_/Custom-Thank-You-For-Your-Order-Stickers.jpg"
        alt="Thank you"
      ></img>
      <Link
        to="/"
        className="bg-theme-1-500 text-theme-1-50 rounded-full px-4 py-2 mt-3 w-72 text-center font-bold"
      >
        Want to buy more?
      </Link>
      <a
        className="mt-1 font-thin hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href={"https://wa.me/" + helpPhoneNumber + "?text=" + helpMessage}
      >
        Need help or is your order taking too long?
      </a>
      <img
        className="w-24 hedgehog absolute"
        src="https://media4.giphy.com/media/3ohrysN9ge0eqKphCM/giphy.gif"
        alt="Hedgehog walking across screen"
      ></img>
    </div>
  );
}
