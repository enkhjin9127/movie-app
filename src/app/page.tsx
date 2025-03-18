"use client";

import MovieSection from "@/components/MovieSection";
import Upcoming from "@/components/NowPlaying";

export default function Page() {
  return (
    <div>
      <Upcoming />
      <MovieSection
        title="Upcoming"
        endpoint="/movie/upcoming?language=en-US&page=1"
      />
      <MovieSection
        title="Popular"
        endpoint="/movie/popular?language=en-US&page=1"
      />
      <MovieSection
        title="Top Rated"
        endpoint="/movie/top_rated?language=en-US&page=1"
      />
    </div>
    //hi
  );
}
