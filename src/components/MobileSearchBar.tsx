"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { Search, Star, X, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

interface Genre {
  id: number;
  name: string;
}

const MobileSearchBar = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    {
      id: number;
      title: string;
      poster_path: string;
      vote_average: number;
      release_date: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchGenres = async () => {
      if (!TMDB_API_TOKEN || !TMDB_BASE_URL) return;
      try {
        const response = await axios.get(
          `${TMDB_BASE_URL}/genre/movie/list?language=en-US`,
          {
            headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
          }
        );
        setGenres(response.data.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreChange = (genreId: number) => {
    const updatedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter((id) => id !== genreId)
      : [...selectedGenres, genreId];

    setSelectedGenres(updatedGenres);

    const queryParams = new URLSearchParams(searchParams);
    if (updatedGenres.length > 0) {
      queryParams.set("genreIds", updatedGenres.join(","));
    } else {
      queryParams.delete("genreIds");
    }

    router.replace(`/genres?${queryParams.toString()}`, { scroll: false });
  };

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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex flex-col items-center">
      {/* Search Bar */}
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 p-3 shadow-lg rounded-b-lg">
        <div className="flex items-center">
          {/* Genre Filter Toggle */}
          <button
            className="w-full max-w-9 h-9 flex items-center justify-between p-3 bg-white dark:bg-gray-900 shadow-lg rounded-lg mt-2 text-lg font-medium"
            onClick={() => setIsGenreOpen(!isGenreOpen)}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isGenreOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <Search className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Search movies..."
            className="flex-1 mx-3 bg-transparent text-lg focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      {/* Genre Filter Dropdown (Animated) */}
      <AnimatePresence>
        {isGenreOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-lg p-5"
          >
            <h3 className="text-lg font-bold">Genres</h3>
            <p className="text-sm text-gray-500 mb-3">
              See lists of movies by genre
            </p>
            <hr className="mb-3" />

            {genres.length === 0 && (
              <p className="text-center">Loading genres...</p>
            )}

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {genres.map((genre) => (
                  <Badge
                    key={genre.id}
                    onClick={() => handleGenreChange(genre.id)}
                    className={`cursor-pointer rounded-full border h-[22px] transition ${
                      selectedGenres.includes(genre.id)
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {genre.name}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Search Results */}
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-lg mt-2 max-h-[60vh] overflow-y-auto">
        {loading && <p className="text-center p-3">Loading...</p>}
        {!loading && results.length > 0 && (
          <div className="divide-y dark:divide-gray-700">
            {results.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-3 p-4 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => {
                  router.push(`/movie/${movie.id}`);
                  setQuery("");
                  onClose();
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
                  <p className="text-base font-medium">{movie.title}</p>
                  <p className="text-sm text-gray-500">
                    {movie.release_date?.split("-")[0] || "N/A"}
                  </p>
                  <div className="flex items-center gap-x-2 mt-1">
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
    </div>
  );
};

export default MobileSearchBar;
