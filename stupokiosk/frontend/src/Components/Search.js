import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = (value, list) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0
    ? []
    : list
        .filter((category) => {
          if (!category.keywords) return false; // should not happen

          return category.keywords.search(inputValue) > -1;
        })
        .slice(0, 10); // Only take first "silce" of results
};

export default function Search(props) {
  const [suggestions, setSuggestions] = useState([]);
  const [hideSuggestions, setHideSuggestions] = useState(true);
  const searchFocusRef = useRef(null);

  const changeSearchString = (newValue) => {
    props.setSearchString(newValue);
    setSuggestions(getSuggestions(newValue, props.list));
  };

  function resetEscape() {
    //setSuggestions([]);
    setHideSuggestions(true);
  }

  document.onKeypress = function (e) {
    e = e || window.event;

    if (e.keyCode === 27) {
      resetEscape();
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  });

  function handleClickOutside(e) {
    //var isInsideSearchBar =
    if (
      searchFocusRef &&
      searchFocusRef.current &&
      !searchFocusRef.current.contains(e.target)
    ) {
      resetEscape();
    }
  }

  function onSearchingFor(suggestion) {
    props.setSearchingFor(suggestion.id);

  }

  return (
    <div ref={searchFocusRef} className="relative w-1/2 sm:w-1/3">
      <input
        autoFocus
        onClick={() => setHideSuggestions(false)}
        className="w-full border-solid border-2 border-blue-100 rounded py-1 pl-4 text-xl sm:text-base sm:pl-2"
        type="text"
        placeholder="Search"
        onChange={(e) => changeSearchString(e.target.value)}
      />
      {suggestions && !hideSuggestions && (
        <div className="absolute cursor-pointer maxw-screen w-60 sm:w-full bg-white divide-y divide-grey-300 divide-opacity-100 sm:divide-opacity-0">
          {suggestions.map((suggestion, i) => {
            return (
              <div key={i} className="group">
                <Link
                  to="/"
                  className="block text-2xl sm:text-base p-2 bg-theme-1-50 rounded-b group-hover:text-theme-1-900"
                  onClick={() => onSearchingFor(suggestion)}
                >
                  {suggestion.name}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
