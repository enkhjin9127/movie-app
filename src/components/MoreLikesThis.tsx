import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_SERVICE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

export default function MoreLikeThis() {
  const { id } = useParams();
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      try {
        const response = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}/similar?language=en-US&page=1`,
          {
            headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
          }
        );
        setSimilarMovies(response.data.results.slice(0, 5)); // Get top 5
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
  }, [id]);

  if (loading) return <p className="text-center">Loading similar movies...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!similarMovies.length)
    return (
      <p className="text-center text-gray-500">No similar movies found.</p>
    );

  return (
    <div className="mt-10 px-5">
      {/* Title & See More Link */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">More like this</h2>
        <Link
          href={`/movie/${id}/similar`}
          className="flex items-center text-sm sm:text-base"
        >
          See more <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Responsive Grid for Movies */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
        {similarMovies.map((movie) => (
          <Link key={movie.id} href={`/movie/${movie.id}`} className="block">
            <div className="relative">
              <Image
                src={`${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`}
                alt={movie.title}
                width={180}
                height={270}
                className="w-full h-auto rounded-lg"
              />
              <div className="p-3 bg-gray-100 dark:bg-[#262626] flex flex-col flex-grow">
                <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  <Star
                    className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 mr-1"
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
    </div>
  );
}
