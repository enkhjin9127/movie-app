"use client";

import { Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;
const TMDB_API_TOKEN = process.env.TMDB_API_TOKEN;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popularMoviesData, setPopularMoviesData] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const getMovieData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${TMDB_BASE_URL}/movie/popular?language=en-US&page=1`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_TOKEN}`,
          },
        }
      );
      setPopularMoviesData(response.data.results.slice(0, 8)); // Limit to 8 movies
      console.log(response);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data.status_message || "Error fetching movies"
        );
      }
    }
  };

  useEffect(() => {
    getMovieData();
  }, []);

  // Auto-slide effect with infinite looping
  useEffect(() => {
    if (popularMoviesData.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex(
        (prevIndex) => (prevIndex + 1) % (popularMoviesData.length + 1)
      ); // Adds one extra slide for looping
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [popularMoviesData]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      {loading && <p className="text-center mt-10">Loading movies...</p>}
      {error && <p className="text-center mt-10 text-red-500">{error}</p>}

      {!loading && !error && popularMoviesData.length > 0 && (
        <div className="relative mt-[59px] lg:mt-[83px] w-screen max-w-full mx-auto">
          <Carousel className="w-screen relative overflow-hidden">
            <CarouselContent
              style={{
                transform: `translateX(-${
                  (activeIndex % popularMoviesData.length) * 100
                }%)`,
                transition:
                  activeIndex === popularMoviesData.length
                    ? "none"
                    : "transform 0.8s ease-in-out",
              }}
            >
              {[...popularMoviesData, popularMoviesData[0]].map(
                (movie, index) => (
                  <CarouselItem
                    key={index}
                    className="relative w-screen h-[500px] lg:h-[600px]"
                  >
                    {/* ✅ Full Width Image */}
                    <Image
                      src={`${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover w-full h-full"
                    />

                    {/* ✅ Overlay Content */}
                    <div className="absolute inset-24 flex items-center p-6 lg:p-10 text-white">
                      <div className="space-y-4">
                        <h4 className="text-sm">Now Playing:</h4>
                        <h3 className="text-2xl font-bold truncate">
                          {movie.title}
                        </h3>

                        <div className="flex items-center gap-x-1">
                          <Star
                            className="w-6 h-6 text-[#FDE047]"
                            fill="#FDE047"
                          />
                          <span className="text-lg">
                            {movie.vote_average.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-300">/10</span>
                        </div>

                        <p className="text-sm line-clamp-3 w-[300px]">
                          {movie.overview}
                        </p>

                        <Button variant="secondary">
                          <Play className="w-4 h-4" />
                          <span className="text-sm ml-2">Watch Trailer</span>
                        </Button>
                      </div>
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>

            {/* ✅ Move Buttons Inside the Image */}
            <CarouselPrevious
              onClick={() =>
                setActiveIndex((prevIndex) =>
                  prevIndex === 0 ? popularMoviesData.length - 1 : prevIndex - 1
                )
              }
              className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10"
            />
            <CarouselNext
              onClick={() =>
                setActiveIndex(
                  (prevIndex) => (prevIndex + 1) % popularMoviesData.length
                )
              }
              className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10"
            />
          </Carousel>
        </div>
      )}
    </div>
  );
}
