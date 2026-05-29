import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
  alignment?: "center" | "left";
  target?: "dashboard" | "landingPage";
}
const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL;

const Logo: React.FC<LogoProps> = ({
  size = "medium",
  className,
  alignment,
  target = "landingPage",
}) => {
  const sizeClasses = {
    small: "w-4 h-4 text-xs text-accent",
    medium: "w-6 h-6 text-lg text-accent",
    large: "w-8 h-8 text-xl text-accent",
  };

  return (
    <Link
      to={target === "landingPage" ? landingPageUrl : "/dashboard"}
      className={`flex items-center gap-3 hover:opacity-80 transition-opacity w-fit mb-10 ${alignment === "center" ? "mx-auto" : ""} ${className}`}
    >
      <Sparkles className={sizeClasses[size]} />
      <span
        className={`font-bold text-foreground tracking-tight ${
          size === "small"
            ? "text-sm"
            : size === "medium"
              ? "text-lg"
              : "text-xl"
        }`}
      >
        FaithCare
      </span>
    </Link>
  );
};

export default Logo;
