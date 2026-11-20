import { useState } from "react";
import { Home } from "lucide-react";
import { photoUrl } from "../../utils/format";

export default function Photo({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-forest-50 text-forest-800 ${className}`}>
        <Home className="h-8 w-8" />
      </div>
    );
  }
  return <img src={photoUrl(src)} alt={alt} className={className} onError={() => setFailed(true)} />;
}
