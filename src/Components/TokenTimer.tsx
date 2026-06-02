import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";

// Define the interface for the decoded token
interface DecodedToken extends JwtPayload {
  exp: number; // The expiration time (in seconds)
}

// Format the remaining seconds as HH:MM:SS (or MM:SS when under an hour)
const formatRemaining = (totalSeconds: number): string => {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = Math.floor(safe % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
};

const TokenTimer = () => {
  const router = useRouter();
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [remaining, setRemaining] = useState<number | null>(null); // seconds left
  const [isTokenValid, setIsTokenValid] = useState<boolean>(true);

  // Clears the token and sends the user back to the login screen
  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setIsTokenValid(false);
    router.replace("/");
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      logout();
      return;
    }

    let decodedToken: DecodedToken | null = null;
    try {
      decodedToken = jwt.decode(token) as DecodedToken | null;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }

    if (!decodedToken || typeof decodedToken.exp !== "number") {
      logout();
      return;
    }

    const expMs = decodedToken.exp * 1000;
    setExpirationDate(new Date(expMs).toLocaleString());

    // Update the countdown every second and log out when it hits zero
    const tick = () => {
      const secondsLeft = Math.round((expMs - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        setRemaining(0);
        logout();
        return false; // stop ticking
      }
      setRemaining(secondsLeft);
      return true;
    };

    // Run once immediately so the UI doesn't show empty for a second
    if (!tick()) return;

    const intervalId = setInterval(() => {
      if (!tick()) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [logout]);

  // const isWarning = remaining !== null && remaining <= 60;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Admin Panel</h1>
      {isTokenValid && remaining !== null ? (
        <div className="mb-4">
          <p className="text-lg">
            Session expires in:{" "}
            <span className="font-medium">{formatRemaining(remaining)}</span>
          </p>
          <p className="text-sm text-gray-500">
            Expiration Date: {expirationDate}
          </p>
        </div>
      ) : (
        <p className="text-lg mb-4">
          Token is invalid or expired. Please log in again.
        </p>
      )}
    </div>
  );
};

export default TokenTimer;
