import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getFoods } from "../../api/foodService";
import SearchFoodCard from "./SearchFoodCard";
import SearchCategoryChips from "./SearchCategoryChips";
import { categories, categoryFilters } from "./searchConfig";
import shuffleArray from "../../utils/shuffleArray";
import axios from "axios"; //

const SearchFoodTab = () => {
  const [foods, setFoods] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // FETCH FOODS
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setIsLoading(true);
        const response = await getFoods();
        setFoods(response.data || []);
      } catch (error) {
        console.error("❌ Failed loading foods:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // DEBOUNCED SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1500);
    return () => clearTimeout(timer);
  }, [search]);

  // FETCH KE BACKEND PAS NGETIK
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // NEMBAK KE API HYBRID 
        const response = await axios.get(
          `http://127.0.0.1:5000/api/foods/search?keyword=${debouncedSearch}`
        );
        setSearchResults(response.data.data || []);
      } catch (error) {
        console.error("❌ Search API failed:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearch]);

  // FILTERED FOODS
  const filteredFoods = useMemo(() => {
    // Kalau lagi ngetik pencarian, pakai data dari backend
    if (debouncedSearch.trim()) {
      return searchResults; 
    }

    // Kalau kolom search kosong, pakai data awal + filter kategori
    let filtered = foods;
    if (selectedCategory && categoryFilters[selectedCategory]) {
      filtered = filtered.filter(categoryFilters[selectedCategory]);
    }

    return shuffleArray(filtered).slice(0, 8);
  }, [foods, searchResults, debouncedSearch, selectedCategory]);

  return (
    <div className="bg-[#eefaf1] w-full flex-grow mt-4 pt-10 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* SEARCH BAR */}
        <div className="relative mb-5">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedCategory("");
            }}
            placeholder="Search food..."
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#22C55E] transition-all"
          />
        </div>

        {/* CATEGORY CHIPS */}
        {!search && (
          <SearchCategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="text-center text-sm text-gray-500 py-10">
            Loading foods...
          </div>
        )}

        {/* RESULTS */}
        {!isLoading && filteredFoods.length > 0 && (
          <div className="space-y-4">
            {filteredFoods.map((food) => (
              <SearchFoodCard key={food.id} food={food} />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!isLoading &&
          (search || selectedCategory) &&
          filteredFoods.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 py-16 text-center">
              <h3 className="font-bold text-gray-800 mb-2">Food not found</h3>

              <p className="text-sm text-gray-400">
                Try searching with another keyword or category.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default SearchFoodTab;
