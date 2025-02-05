"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Play, Star } from "lucide-react";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

export default function MovieDetail() {
  const { id } = useParams(); // Get the movie ID from the URL

  interface Genre {
    id: number;
    name: string;
  }

  interface Movie {
    poster_path: string;
    title: string;
    vote_average: number;
    overview: string;
    backdrop_path: string;
    release_date: string;
    genres: Genre[];
  }

  interface Trailer {
    key: string;
    site: string;
    type: string;
  }

  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}?language=en-US`,
          {
            headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
          }
        );
        setMovie(response.data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setError("Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovieDetails();
  }, [id]);

  const fetchTrailer = async () => {
    try {
      const response = await axios.get(
        `${TMDB_BASE_URL}/movie/${id}/videos?language=en-US`,
        {
          headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
        }
      );

      const trailer = response.data.results.find(
        (video: Trailer) => video.type === "Trailer" && video.site === "YouTube"
      );

      if (trailer) {
        setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
      } else {
        alert("No trailer available 😢");
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
      alert("Failed to load trailer.");
    }
  };

  if (loading)
    return <p className="text-center mt-10">Loading movie details...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!movie)
    return <p className="text-center mt-10 text-red-500">Movie not found.</p>;

  return (
    <div className="max-w-screen-lg py-10 pt-[59px]">
      <div className="flex justify-between mt-8 mb-4 px-5">
        <div>
          <h1 className="text-2xl font-bold w-52 lg:w-fit lg:text-4xl">
            {movie.title}
          </h1>
          <span className="text-sm lg:text-lg">{movie.release_date}</span>
        </div>
        <div className="text-gray-500 text-sm flex">
          <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
          <div className="text-black">{movie.vote_average.toFixed(1)}</div> / 10
        </div>
      </div>

      <div className="overflow-hidden relative hidden lg:block w-[290px] h-[428px] rounded">
        {movie.poster_path ? (
          <Image
            src={`${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`}
            alt={movie.title}
            width={350}
            height={525}
            className="rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-[350px] h-[525px] bg-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">No Image Available</p>
          </div>
        )}
      </div>
      <div className="relative w-[375px] h-[211px] lg:w-[760px] lg:h-[428px] lg:rounded">
        <Image
          src={`${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`}
          alt={movie.title}
          layout="fill"
          className="object-cover"
        />
      </div>
      <p className="mt-4 text-gray-700 dark:text-gray-300">{movie.overview}</p>

      {/* Movie Release Date & Genres */}
      <div className="mt-4">
        <p className="text-gray-500">🎬 Release Date: </p>
        <p className="text-gray-500">
          🎭 Genres:{" "}
          {movie.genres.length > 0 ? (
            movie.genres.map((genre) => (
              <span key={genre.id} className="font-medium">
                {genre.name},{" "}
              </span>
            ))
          ) : (
            <span className="font-medium">No genres available</span>
          )}
        </p>
      </div>

      {/* Play Trailer Button */}
      <div className="flex items-center">
        <button
          onClick={fetchTrailer}
          className="bg-gray-500 text-black px-4 py-2"
        >
          <Play />
        </button>
        <div>Play Trailer</div>
      </div>

      {/* Trailer Modal */}
      {trailerUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative bg-black p-4 rounded-lg max-w-2xl w-full">
            <button
              onClick={() => setTrailerUrl(null)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md"
            >
              ✖
            </button>
            <iframe
              className="w-full h-64 md:h-96"
              src={trailerUrl.replace("watch?v=", "embed/")}
              title="Movie Trailer"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
