"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

export default function MovieCategoryPage() {
  const { category } = useParams(); // Get dynamic category from URL
  const router = useRouter();
  const searchParams = useSearchParams(); // Get query params
  const currentPage = Number(searchParams.get("page")) || 1; // Default to page 1

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1); // Store total pages

  const fetchMovies = async () => {
    try {
      setLoading(true);
      if (!category) return;

      const response = await axios.get(`${TMDB_BASE_URL}/movie/${category}`, {
        headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
        params: { page: currentPage }, // Fetch based on current page
      });

      setMovies(response.data.results);
      setTotalPages(response.data.total_pages); // Update total pages
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
  }, [category, currentPage]); // Fetch data when category or page changes

  // Handle page change
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/movies/${category}?page=${newPage}`);
    }
  };

  return (
    <section className="my-10 px-4 pt-[57px]">
      <div className="max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold capitalize">
            {category ? category.toString().replace("-", " ") : "Movies"}
          </h2>
        </div>

        {/* Movie Grid */}
        {loading && <p>Loading movies...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && movies.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="rounded-lg shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/movie/${movie.id}`)}
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

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-8 gap-4">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-gray-300 rounded-md disabled:opacity-50"
              >
                ← Previous
              </button>

              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-gray-300 rounded-md disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
