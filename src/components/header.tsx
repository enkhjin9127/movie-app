"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Film, Search, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import SearchBar from "./SearchBar";
import { useTheme } from "next-themes";
import axios from "axios";
import { Badge } from "./ui/badge";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

interface Genre {
  id: number;
  name: string;
}

const Header = () => {
  const { setTheme, theme } = useTheme();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        console.log("Fetched Genres:", response.data);

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

  return (
    <div className="fixed top-0 inset-x-0 z-20 h-[59px] bg-background flex items-center justify-center">
      <div className="flex items-center justify-between w-full max-w-screen-xl px-5 lg:px-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-x-2 text-indigo-700">
          <Film className="w-5 h-5" />
          <h4 className="font-bold italic text-base cursor-pointer">Movie Z</h4>
        </Link>

        {/* Genre Dropdown and Search */}
        <div className="relative hidden lg:flex items-center gap-x-3">
          <button
            onClick={() => setIsGenreOpen(!isGenreOpen)}
            className="w-[110px] h-9 text-sm font-medium flex items-center justify-between px-3 border rounded-md"
          >
            Genre <ChevronDown className="w-4 h-4" />
          </button>

          {/* Genre Dropdown Menu */}
          {isGenreOpen && (
            <div className="absolute top-12 left-0 bg-white shadow-lg rounded-lg p-5 w-[400px] z-50">
              <h3 className="text-lg font-bold">Genres</h3>
              <p className="text-sm text-gray-500 mb-3">
                See lists of movies by genre
              </p>
              <hr className="mb-3" />

              {loading && <p className="text-center">Loading...</p>}
              {error && <p className="text-red-500 text-center">{error}</p>}

              {!loading && !error && genres.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {genres.map((genre) => (
                    <Badge
                      key={genre.id}
                      className="px-3 py-2 text-sm rounded-full border"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative text-muted-foreground w-[379px]">
            <SearchBar />
          </div>
        </div>

        {/* Theme Toggle & Mobile Search */}
        <div className="flex items-center gap-x-3">
          <Button className="w-9 h-9 sm:hidden" variant={"outline"}>
            <Search />
          </Button>

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
  );
};

export default Header;
