"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

export default function SimilarMoviesPage() {
  const { id } = useParams();
  const router = useRouter();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch similar movies
  useEffect(() => {
    const fetchSimilarMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}/similar?language=en-US&page=${page}`,
          {
            headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
          }
        );
        setMovies(response.data.results);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error("Error fetching similar movies:", error);
        setError("Failed to load similar movies.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSimilarMovies();
    }
  }, [id, page]); // Refetch when movie ID or page changes

  return (
    <div className="mt-10 px-5 max-w-screen-xl mx-auto pt-[57px]">
      {/* Back Button */}
      <div className="flex items-center gap-x-3 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
      </div>

      {/* Title */}
      <h2 className="text-4xl text-center mb-6">More Like This</h2>

      {/* Loading & Error Handling */}
      {loading && (
        <p className="text-center">
          <Loader2 className="animate-spin w-6 h-6 mx-auto" />
        </p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p className="text-center text-gray-500">No similar movies found.</p>
      )}

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movie/${movie.id}`} className="block">
            <div className="rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 bg-white dark:bg-[#1a1a1a]">
              <div className="w-full h-[340px] overflow-hidden">
                <Image
                  src={`${TMDB_IMAGE_BASE_URL}/w300${movie.poster_path}`}
                  alt={movie.title}
                  width={180}
                  height={340}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
              <div className="p-3 bg-gray-100 dark:bg-[#262626] flex flex-col flex-grow">
                <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  <Star
                    className="w-4 h-4 text-yellow-400 mr-1"
                    fill="currentColor"
                  />
                  {movie.vote_average.toFixed(1)}/10
                </div>
                <h3 className="mt-2 font-semibold min-h-[2.8rem] line-clamp-2">
                  {movie.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-x-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-lg font-semibold">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
