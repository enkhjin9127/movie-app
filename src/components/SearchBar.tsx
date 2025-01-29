import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
      />
      <Input
        type="text"
        placeholder="Search..."
        className="pl-[38px] pr-[12px] h-9 w-[327px]"
      />
    </div>
  );
}
