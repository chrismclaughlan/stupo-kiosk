import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

// // Teach Autosuggest how to calculate suggestions for any given input value.
// const getSuggestions = (value, list) => {
//   const inputValue = value.trim().toLowerCase();
//   const inputLength = inputValue.length;

//   return inputLength === 0
//     ? []
//     : list
//         .filter((category) => {
//           if (!category.keywords) return false; // should not happen

//           return category.keywords.search(inputValue) > -1;
//         })
//         .slice(0, 10); // Only take first "silce" of results
// };

const Search = ({
  searchFocusRef,
  hideSuggestions,
  setHideSuggestions,
  setErrorMsg,
  searchString,
  setSearchString,
  setSearchingFor,
}) => {
  const [suggestions, setSuggestions] = useState([]);

  const getSuggestions = useCallback(
    (value) => {
      fetch(`/api/catalogue/categories?page=1&per_page=10&search=${value}`)
        .then((res) => res.json())
        .then((results) => {
          if (Array.isArray(results) || results.length !== 0)
            setSuggestions(results);
        })
        .catch((error) => {
          console.error(`error: ${error}`);
          setErrorMsg(`Error searching: ${error}`);
        });
    },
    [setErrorMsg, setSuggestions]
  );

  useEffect(() => {
    if (searchString === "") {
      setHideSuggestions(true);
    } else {
      getSuggestions(searchString);
      setHideSuggestions(false);
    }
  }, [searchString, getSuggestions, setHideSuggestions]);

  return (
    <div ref={searchFocusRef} className="relative w-1/2 sm:w-1/3">
      <input
        autoFocus
        onClick={() => setHideSuggestions(false)}
        className="w-full border-solid border-2 border-blue-100 rounded py-1 pl-4 text-xl sm:text-base sm:pl-2"
        type="text"
        placeholder="Search"
        onChange={(e) => setSearchString(e.target.value)}
      />
      {suggestions && !hideSuggestions && (
        <div className="absolute cursor-pointer maxw-screen w-60 sm:w-full bg-white divide-y divide-grey-300 divide-opacity-100 sm:divide-opacity-0">
          {Array.isArray(suggestions) &&
            suggestions.map((suggestion, i) => {
              return (
                <div key={i} className="group">
                  <Link
                    to="/"
                    className="block text-2xl sm:text-base p-2 bg-theme-1-50 rounded-b group-hover:text-theme-1-900"
                    onClick={() => setSearchingFor(suggestion.id)}
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
};

export default Search;
