"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: number; title: string; poster_path: string; vote_average: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${TMDB_BASE_URL}/search/movie?query=${query}&language=en-US&page=1`,
          {
            headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
          }
        );
        setResults(response.data.results.slice(0, 5));
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchMovies();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for movies..."
          className="pl-10 w-full h-10 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
      </div>

      {query && results.length > 0 && (
        <div className="absolute w-full mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg max-h-[694px] overflow-y-auto max-w-xl">
          {loading && <p className="p-3 text-center text-sm">Loading...</p>}
          {!loading &&
            results.map((movie) => (
              <div
                key={movie.id}
                className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3"
                onClick={() => {
                  router.push(`/movie/${movie.id}`);
                  setQuery(""); // Closes the search results after clicking
                }}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  width={92}
                  height={138}
                  className="w-12 h-16 object-cover rounded"
                />
                <div>
                  <p className="text-sm font-medium">{movie.title}</p>
                  <div className="flex items-center gap-x-2 mt-2">
                    <Star
                      className="w-5 h-5 text-[#FDE047]"
                      fill="currentColor"
                    />
                    <span className="text-md font-semibold dark:text-white">
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <span className="text-sm dark:text-white">/10</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
