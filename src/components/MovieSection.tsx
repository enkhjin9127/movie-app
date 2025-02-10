"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

interface MovieSectionProps {
  title: string;
  endpoint: string;
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

  const router = useRouter();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
      });
      setMovies(response.data.results.slice(0, 10));
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
          <Link
            href={`/movies/${endpoint.replace("/movie/", "")}`}
            className="text-gray-500 hover:text-black text-sm"
          >
            See more →
          </Link>
        </div>

        {/* Movie Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 bg-white dark:bg-[#1a1a1a]"
                onClick={() => router.push(`/movie/${movie.id}`)}
              >
                <div className="w-full h-[340px] overflow-hidden">
                  <Image
                    src={`${TMDB_IMAGE_BASE_URL}/w300${movie.poster_path}`}
                    alt={movie.title}
                    width={180}
                    height={340}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-3 bg-gray-100 dark:bg-[#262626]">
                  <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    <Star
                      className="w-4 h-4 text-yellow-400 mr-1"
                      fill="currentColor"
                    />
                    {movie.vote_average.toFixed(1)}/10
                  </div>
                  <h3 className="mt-2 text-md font-semibold leading-tight">
                    {movie.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
