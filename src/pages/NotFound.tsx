import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FaSadTear } from "react-icons/fa"; // Importing an icon for added flair

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="text-center bg-white rounded-lg shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
        <FaSadTear className="text-6xl text-gray-600 mb-4 animate-bounce" />
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <p className="text-md text-gray-500 mb-6">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        <a
          href="/"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;