"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Film,
  Search,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import SearchBar from "./SearchBar";
import { useTheme } from "next-themes";
import axios from "axios";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import MobileSearchBar from "./MobileSearchBar";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

interface Genre {
  id: number;
  name: string;
}

const Header = () => {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genreRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genreRef.current &&
        !genreRef.current.contains(event.target as Node)
      ) {
        setIsGenreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load selected genres from URL on mount
  useEffect(() => {
    const genreIdsFromURL = searchParams.get("genreIds");
    if (genreIdsFromURL) {
      setSelectedGenres(genreIdsFromURL.split(",").map(Number));
    }
  }, [searchParams]);

  // Fetch genres from TMDB API
  useEffect(() => {
    const fetchGenres = async () => {
      if (!TMDB_API_TOKEN || !TMDB_BASE_URL) {
        console.error("Missing API key or base URL");
        setError("Missing API key or base URL");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${TMDB_BASE_URL}/genre/movie/list?language=en-US`,
          {
            headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
          }
        );

        if (response.data.genres && response.data.genres.length > 0) {
          setGenres(response.data.genres);
        } else {
          console.error("Genres list is empty");
          setError("No genres found");
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
        setError("Failed to load genres");
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Handle genre selection
  const handleGenreChange = (genreId: number) => {
    const updatedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter((id) => id !== genreId) // Remove if already selected
      : [...selectedGenres, genreId]; // Add if not selected

    setSelectedGenres(updatedGenres);

    const queryParams = new URLSearchParams(searchParams);
    if (updatedGenres.length > 0) {
      queryParams.set("genreIds", updatedGenres.join(","));
    } else {
      queryParams.delete("genreIds");
    }

    router.replace(`/genres?${queryParams.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50"
          >
            <MobileSearchBar onClose={() => setIsMobileSearchOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="fixed top-0 inset-x-0 z-20 h-[59px] bg-background flex items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-screen-xl px-5 lg:px-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-x-2 text-indigo-700">
            <Film className="w-5 h-5" />
            <h4 className="font-bold italic text-base cursor-pointer">
              Movie Z
            </h4>
          </Link>

          {/* Genre Dropdown and Search (Desktop) */}
          <div className="relative hidden lg:flex items-center gap-x-3">
            <button
              onClick={() => setIsGenreOpen(!isGenreOpen)}
              className="w-[110px] h-10 text-sm font-medium flex items-center justify-between px-3 border rounded-md"
            >
              Genre <ChevronDown className="w-4 h-4" />
            </button>

            {/* Genre Dropdown Menu */}
            {isGenreOpen && (
              <div
                ref={genreRef}
                className="absolute top-12 left-0 bg-white dark:bg-[#262626] shadow-lg rounded-lg p-5 w-[400px] z-50"
              >
                <h3 className="text-lg font-bold">Genres</h3>
                <p className="text-sm text-gray-500 mb-3">
                  See lists of movies by genre
                </p>
                <hr className="mb-3" />

                {loading && <p className="text-center">Loading...</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}

                {!loading && !error && genres.length > 0 && (
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
              </div>
            )}

            {/* Search Bar (Desktop) */}
            <div className="relative text-muted-foreground w-[379px]">
              <SearchBar />
            </div>
          </div>

          {/* Theme Toggle & Mobile Search */}
          <div className="flex items-center gap-x-3">
            <Button
              className="w-9 h-9 sm:hidden"
              variant={"outline"}
              onClick={() => setIsMobileSearchOpen(true)}
            >
              <Search />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              className="w-9 h-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
