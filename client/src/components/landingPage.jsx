import React from "react";
import Logo from "./logo";
import Footer from "./footer";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Headphones,
  FileText,
  Wand,
  Book,
  Stars,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Hero Section */}
      <div className="relative w-full">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEyOSwgMTQwLCAyNDgsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        {/* Main content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo */}
            <div className="animate-fade-in-up mb-8">
              <Logo />
            </div>
              <h3 className="text-4xl font-bold mt-5 text-purple-900">
                Where Literature Meets AI
              </h3>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-transparent bg-clip-text animate-fade-in-up delay-100 leading-tight">
              Unleash Your Story's <br className="hidden sm:block" />
              True Potential
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl animate-fade-in-up delay-200">
              Where human creativity meets AI brilliance. Transform your ideas
              into captivating narratives that resonate across genres, complete
              with immersive audio experiences.
            </p>

            <div className="flex gap-4 mt-8 animate-fade-in-up delay-300">
              <button
                className="group bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-lg px-6 py-5 sm:px-8 sm:py-6 rounded-lg flex items-center justify-center"
                onClick={() => navigate("/app")}
              >
                <Wand className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
                Begin Your Journey
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 w-full max-w-5xl animate-fade-in-up delay-400">
              {/* Feature 1 */}
              <div className="group p-6 sm:p-8 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative flex flex-col items-center space-y-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Genre-Perfect Stories
                    </h3>
                    <p className="text-gray-600 text-center text-sm sm:text-base">
                      Watch your ideas transform into perfectly crafted stories
                      that capture the essence of your chosen genre.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 sm:p-8 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative flex flex-col items-center space-y-4">
                    <div className="p-3 bg-pink-100 rounded-full">
                      <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Immersive Audio
                    </h3>
                    <p className="text-gray-600 text-center text-sm sm:text-base">
                      Experience your stories brought to life with professional
                      narration and ambient soundscapes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 sm:p-8 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative flex flex-col items-center space-y-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Perfect Formatting
                    </h3>
                    <p className="text-gray-600 text-center text-sm sm:text-base">
                      Your stories are automatically formatted with professional
                      typography and layout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
