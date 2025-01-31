"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;
const TMDB_API_TOKEN = process.env.TMDB_API_TOKEN;

interface MovieSectionProps {
  title: string;
  endpoint: string; // API URL for different categories
}

export default function MovieSection({ title, endpoint }: MovieSectionProps) {
  interface Movie {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
  }

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
      });
      setMovies(response.data.results.slice(0, 10)); // Limit to 10 movies
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data.status_message || "Error fetching movies"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [endpoint]);

  return (
    <section className="my-10 px-4">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Link href="/" className="text-gray-500 hover:text-black text-sm">
            See more →
          </Link>
        </div>

        {/* Loading & Error Handling */}
        {loading && <p>Loading {title} movies...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Movie Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className=" rounded-lg shadow-sm overflow-hidden"
              >
                <Image
                  src={`${TMDB_IMAGE_BASE_URL}/w300${movie.poster_path}`}
                  alt={movie.title}
                  width={180}
                  height={270}
                  className="w-full h-auto rounded-lg"
                />
                <div className="p-2 bg-gray-100 dark:bg-[#262626]">
                  <div className="flex items-center text-xs ">
                    <Star
                      className="w-3 h-3 text-yellow-400 mr-1"
                      fill="currentColor"
                    />
                    {movie.vote_average.toFixed(1)}/10
                  </div>
                  <h3 className="mt-1 text-lg font-medium">{movie.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
