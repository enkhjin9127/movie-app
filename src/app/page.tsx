import { Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="h-screen ">
      <div className="relative mt-[59px] lg:mt-[83px] w-screen overflow-hidden">
        <div className="overflow-hidden">
          <div className="flex -ml-4">
            <div className="min-w-0 shrink-0 grow-0 basis-full pl-4">
              <div className="relative">
                <p className="w-[430px] h-[246px] flex items-center justify-center">
                  IMG
                </p>
                <div className="static text-foreground lg:absolute lg:top-1/2 lg:left-[140px] lg:-translate-y-1/2 lg:text-white z-10">
                  <div className="p-5 space-y-4 lg:p-0">
                    <div className="flex justify-between lg:flex-col lg:space-y-1">
                      <div>
                        <h4 className="text-sm">Now Playing:</h4>
                        <h3 className="w-52 text-2xl font-semibold truncate">
                          Culpa tuya
                        </h3>
                      </div>
                      <div className="flex items-center gap-x-1">
                        <Star
                          className="w-7 h-7 text-[#FDE047]"
                          fill="#fde047"
                        />
                        <div>
                          <span className="text-foreground text-sm lg:text-white">
                            7.1
                          </span>
                          <span className="text-muted-foreground text-xs">
                            /10
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="w-[302px] text-sm line-clamp-5">
                      The love between Noah and Nick seems unwavering despite
                      their parents` attempts to separate them. But his job and
                      her entry into college open up their lives to new
                      relationships that will shake the foundations of both
                      their relationship and the Leister family itself.
                    </p>
                    <Button variant={"secondary"}>
                      <Play className="w-4 h-4 " />
                      <h4 className="text-sm">Watch Trailer</h4>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
