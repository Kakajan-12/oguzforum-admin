import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define the interface for the decoded token
interface DecodedToken extends JwtPayload {
    exp: number; // The expiration time (in seconds)
}

const TokenTimer = () => {
    const router = useRouter();
    const [expirationDate, setExpirationDate] = useState<string>(''); // Ensure it's a string
    const [isTokenValid, setIsTokenValid] = useState<boolean>(true); // To track token validity

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/');
            return;
        }

        try {
            const decodedToken = jwt.decode(token) as DecodedToken | null; // Type the decoded token

            // Check if the decodedToken exists and the token is expired
            const currentTime = Date.now() / 1000;

            if (!decodedToken || decodedToken.exp < currentTime) {
                localStorage.removeItem('auth_token');
                router.push('/');
                setIsTokenValid(false); // Token is invalid
                return;
            }

            // Token is valid, set expiration date
            const expiration = new Date(decodedToken.exp * 1000);
            setExpirationDate(expiration.toLocaleString());
            setIsTokenValid(true); // Token is valid

            console.log('Decoded Token:', decodedToken);
        } catch (error) {
            console.error("Failed to decode token:", error);
            localStorage.removeItem('auth_token');
            router.push('/');
            setIsTokenValid(false); // Token is invalid
        }
    }, [router]);

    return (
        <div className="mb-6 flex justify-end">
            <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                    isTokenValid
                        ? "bg-white text-gray-400"
                        : "bg-red-50 text-red-500"
                }`}
            >
                <span
                    className={`h-2 w-2 rounded-full ${
                        isTokenValid ? "bg-green-400" : "bg-red-400"
                    }`}
                />
                {isTokenValid
                    ? `Session until ${expirationDate}`
                    : "Session expired — please log in again"}
            </span>
        </div>
    );
};

export default TokenTimer;
