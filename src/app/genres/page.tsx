"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import GenreFilter from "@/components/GenreFilter";
import Image from "next/image";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

export default function GenresPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const genreIds = searchParams.get("genreIds") || "";
        const pageParam = searchParams.get("page") || "1";
        setPage(Number(pageParam));

        const response = await axios.get(
          `${TMDB_BASE_URL}/discover/movie?language=en-US&page=${page}&with_genres=${genreIds}`,
          {
            headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
          }
        );
        setMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set("page", newPage.toString());
    router.push(`/genres?${queryParams.toString()}`, { scroll: false });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Movie Z - Genres</h1>

      {/* Genre Filter with URL Sync */}
      <GenreFilter />

      {/* Movie List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {loading ? (
          <p className="text-center col-span-full">Loading movies...</p>
        ) : (
          movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <Image
                src={`${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`}
                alt={movie.title}
                width={250}
                height={375}
                className="object-cover"
              />
              <div className="p-2">
                <h2 className="text-sm font-semibold">{movie.title}</h2>
                <p className="text-yellow-500 text-xs">
                  ⭐ {movie.vote_average.toFixed(1)}/10
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          className="px-4 py-2 border rounded-md disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          className="px-4 py-2 border rounded-md"
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
