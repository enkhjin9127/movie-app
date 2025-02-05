import { useEffect } from "react";

interface TrailerModalProps {
  trailerUrl: string | null;
  onClose: () => void;
}

export default function TrailerModal({
  trailerUrl,
  onClose,
}: TrailerModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!trailerUrl) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="relative bg-black p-4 rounded-lg max-w-2xl w-full">
        <button
          onClick={onClose}
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
  );
}
