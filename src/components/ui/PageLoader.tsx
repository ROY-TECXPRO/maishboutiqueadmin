import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageLoaderProps {
  minDuration?: number;
  maxDuration?: number;
}

export function PageLoader({ 
  minDuration = 800, 
  maxDuration = 1500 
}: PageLoaderProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset loading state on route change
    setIsLoading(true);
    setIsVisible(true);

    // Random duration between min and max
    const randomDuration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;

    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      
      // Wait for fade out animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }, randomDuration);

    return () => clearTimeout(loadTimer);
  }, [location.pathname, minDuration, maxDuration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className={`flex items-center justify-center`}
      >
        <div className="relative">
          {/* MB Logo Circle with continuous clockwise rotation */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center animate-spin"
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #333333 100%)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              animationDuration: "1s",
            }}
          >
            <span
              className="text-3xl font-bold"
              style={{
                color: "#ffffff",
                fontFamily: "Georgia, serif",
              }}
            >
              MB
            </span>
          </div>
          
          {/* Outer ring for extra spinning effect */}
          <div
            className="absolute -inset-2 rounded-full animate-spin"
            style={{
              border: "3px solid transparent",
              borderTopColor: "#1a1a1a",
              borderRightColor: "#333333",
              animationDuration: "0.8s",
              animationDirection: "normal",
            }}
          />
        </div>
      </div>
    </div>
  );
}
