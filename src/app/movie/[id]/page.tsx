"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MoreLikeThis from "@/components/MoreLikesThis";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

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

  interface CrewMember {
    job: string;
    name: string;
  }

  interface CastMember {
    name: string;
  }

  interface Trailer {
    key: string;
    site: string;
    type: string;
  }

  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [trailerDuration, setTrailerDuration] = useState<string | null>(null); // Store trailer duration
  const [isTrailerOpen, setIsTrailerOpen] = useState(false); // Controls modal visibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [director, setDirector] = useState<string>("Unknown");
  const [writers, setWriters] = useState<string>("Unknown");
  const [stars, setStars] = useState<string>("Unknown");

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

    const fetchMovieCredits = async () => {
      try {
        const response = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}/credits`,
          {
            headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
          }
        );

        console.log("Movie Credits API Response:", response.data);

        const crew: CrewMember[] = response.data.crew;
        const cast: CastMember[] = response.data.cast;

        const directorData = crew.find((person) => person.job === "Director");
        if (directorData) {
          setDirector(directorData.name);
        } else {
          setDirector("Unknown");
        }

        const writerData = crew
          .filter(
            (person) =>
              person.job === "Writer" ||
              person.job === "Screenplay" ||
              person.job === "Story"
          )
          .map((writer) => writer.name)
          .join(", ");

        setWriters(writerData || "Unknown");

        const topStars = cast
          .slice(0, 2)
          .map((actor) => actor.name)
          .join(", ");

        console.log("Stars:", topStars);
        setStars(topStars || "Unknown");
      } catch (error) {
        console.error("Error fetching movie credits:", error);
        setDirector("Unknown");
        setWriters("Unknown");
        setStars("Unknown");
      }
    };

    if (id) {
      fetchMovieDetails();
      fetchMovieCredits();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchTrailer = async () => {
      try {
        const response = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}/videos?language=en-US`,
          {
            headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
          }
        );

        const trailer = response.data.results.find(
          (video: Trailer) =>
            video.type === "Trailer" && video.site === "YouTube"
        );

        if (trailer) {
          setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
          const duration = await fetchTrailerDuration(trailer.key);
          setTrailerDuration(duration);
        } else {
          setTrailerDuration("Not Available");
        }
      } catch (error) {
        console.error("Error fetching trailer:", error);
        setTrailerDuration("Not Available");
      }
    };

    fetchTrailer();
  }, [id]);

  const fetchTrailerDuration = async (trailerId: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${trailerId}&part=contentDetails&key=${YOUTUBE_API_KEY}`
      );
      const durationISO = response.data.items[0]?.contentDetails?.duration;
      return durationISO ? convertISO8601ToDuration(durationISO) : "Unknown";
    } catch (error) {
      console.error("Error fetching trailer duration:", error);
      return "Unknown";
    }
  };

  const convertISO8601ToDuration = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "Unknown";
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`;
  };

  if (loading)
    return <p className="text-center mt-10">Loading movie details...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!movie)
    return <p className="text-center mt-10 text-red-500">Movie not found.</p>;

  return (
    <div className="py-10 pt-[59px] px-4 max-w-[1150px] mx-auto">
      <div className="flex justify-between mt-8 mb-4 px-5">
        <div>
          <h1 className="text-2xl font-bold w-52 lg:w-fit lg:text-4xl">
            {movie.title}
          </h1>
          <span className="text-sm lg:text-lg">{movie.release_date}</span>
        </div>
        <div className="text-gray-500 text-sm flex">
          <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
          <div className="text-black dark:text-white">
            {movie.vote_average.toFixed(1)}
          </div>{" "}
          / 10
        </div>
      </div>
      <div className="px-5">
        <div className="relative w-[375px] h-[211px] lg:w-[760px] lg:h-[428px] lg:rounded">
          <div className="flex gap-x-8 mb-8">
            <Image
              src={`${TMDB_IMAGE_BASE_URL}/original${movie.poster_path}`}
              alt={movie.poster_path}
              width={288}
              height={428}
              className="object-cover hidden lg:block"
            />
            <Image
              src={`${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`}
              alt={movie.title}
              className="object-cover"
              width={760}
              height={428}
            />
          </div>
          <div className="flex items-center relative text-white w-[195px] lg:left-[21.5rem] lg:top-[-5.5rem] left-4 bottom-[5.5rem]">
            <Button
              variant={"secondary"}
              onClick={() => setIsTrailerOpen(true)}
              className="rounded-full w-9 h-9"
            >
              <Play className="w-5 h-5" />
            </Button>
            <span className="ml-3">Play Trailer</span>
            <span className="ml-3">{trailerDuration}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-x-[34px] px-5 pt-8">
        <div className="flex-shrink-0 lg:hidden">
          <Image
            src={`${TMDB_IMAGE_BASE_URL}/original${movie.poster_path}`}
            width={100}
            height={148}
            alt={movie.title}
            className="object-cover w-[100px] h-[148px]"
          />
        </div>
        <div className="">
          <div className="text-gray-500 flex flex-wrap gap-3">
            {movie.genres.length > 0 ? (
              movie.genres.map((genre) => (
                <span key={genre.id} className="font-medium">
                  <Badge variant="outline">{genre.name}</Badge>
                </span>
              ))
            ) : (
              <span className="font-medium">No genres available</span>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-5">
            {movie.overview}
          </p>
        </div>
      </div>
      <div className="space-y-5 text-foreground mb-8 px-5 mt-4">
        <div className="space-y-1">
          <div className="flex pb-1">
            <div className="font-bold w-20">Director:</div>
            <div>{director}</div>
          </div>
        </div>
        <div className="shrink-0 bg-border h-[1px] w-full my-1"></div>
        <div className="space-y-1">
          <div className="flex pb-1 ">
            <div className="font-bold w-20 pr-8">Writers:</div>
            <div>{writers}</div>
          </div>
        </div>
        <div className="shrink-0 bg-border h-[1px] w-full my-1"></div>
        <div className="space-y-1">
          <div className="flex pb-1 ">
            <div className="font-bold w-20 pr-14">Stars:</div>
            <div>{stars}</div>
          </div>
        </div>
        <div className="shrink-0 bg-border h-[1px] w-full my-1"></div>
      </div>

      <MoreLikeThis />

      {/* Trailer Modal */}
      {isTrailerOpen && trailerUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative bg-black p-4 rounded-lg max-w-2xl w-full">
            <button
              onClick={() => setIsTrailerOpen(false)}
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
