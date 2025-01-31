"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;
const TMDB_API_TOKEN = process.env.TMDB_API_TOKEN;

export default function NowPlaying() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  interface Movie {
    backdrop_path: string;
    title: string;
    vote_average: number;
    overview: string;
  }

  const [popularMoviesData, setPopularMoviesData] = useState<Movie[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const getMovieData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${TMDB_BASE_URL}/movie/popular?language=en-US&page=1`,
        {
          headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
        }
      );
      setPopularMoviesData(response.data.results.slice(0, 8)); // Limit to 8 movies
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
    getMovieData();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (popularMoviesData.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % popularMoviesData.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [popularMoviesData]);

  return (
    <div className=" flex flex-col items-center">
      {loading && <p className="text-center mt-10">Loading movies...</p>}
      {error && <p className="text-center mt-10 text-red-500">{error}</p>}

      {!loading && !error && popularMoviesData.length > 0 && (
        <div className="relative w-full max-w-[vw] mt-[59px] lg:mt-[83px]">
          <Carousel className="w-full relative overflow-hidden">
            <CarouselContent
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
                transition: "transform 0.8s ease-in-out",
              }}
            >
              {popularMoviesData.map((movie, index) => (
                <CarouselItem key={index} className="relative w-full">
                  <div className="relative w-full h-[250px] lg:h-[600px]">
                    <Image
                      src={`${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`}
                      alt={movie.title}
                      layout="fill"
                      className="object-cover"
                    />
                  </div>
                  <div className="static text-foreground lg:absolute lg:top-1/2 lg:left-[140px] lg:-translate-y-1/2 z-10">
                    <div className="p-4 relative text-black lg:text-white">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm">Now Playing:</h4>
                          <h3 className="text-xl font-bold truncate dark:text-white">
                            {movie.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-x-2 mt-2">
                          <Star
                            className="w-5 h-5 text-[#FDE047]"
                            fill="currentColor"
                          />
                          <span className="text-md font-semibold dark:text-white">
                            {movie.vote_average.toFixed(1)}
                          </span>
                          <span className=" text-sm dark:text-white">/10</span>
                        </div>
                      </div>
                      <p className="w-[302px] text-sm line-clamp-5 mt-4 dark:text-white">
                        {movie.overview}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 w-[144.45px] flex items-center justify-center bg-gray-200 dark:bg-gray-800 dark:text-white ml-4"
                    >
                      <Play className="w-4 h-4" />
                      <span>Watch Trailer</span>
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* ✅ Show Buttons Only on Larger Screens */}
            <div className="hidden md:block">
              <CarouselPrevious
                onClick={() =>
                  setActiveIndex((prevIndex) =>
                    prevIndex === 0
                      ? popularMoviesData.length - 1
                      : prevIndex - 1
                  )
                }
                className="absolute left-5 top-[40%] transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10"
              />
              <CarouselNext
                onClick={() =>
                  setActiveIndex(
                    (prevIndex) => (prevIndex + 1) % popularMoviesData.length
                  )
                }
                className="absolute right-5 top-[40%] transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10"
              />
            </div>
          </Carousel>
        </div>
      )}
    </div>
  );
}
