import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const VideoCarousel = () => {
  // Sample video data - replace with your actual data
  // const videos = [
  //   {
  //     id: 1,
  //     title: "Epic Gaming Moments",
  //     thumbnail: "/api/placeholder/170/104",
  //     duration: "12:34",
  //   },
  //   {
  //     id: 2,
  //     title: "Pro Strategies Guide",
  //     thumbnail: "/api/placeholder/170/104",
  //     duration: "8:45",
  //   },
  //   {
  //     id: 3,
  //     title: "Best Plays Compilation",
  //     thumbnail: "/api/placeholder/170/104",
  //     duration: "15:20",
  //   },
  //   {
  //     id: 4,
  //     title: "Tutorial Series",
  //     thumbnail: "/api/placeholder/170/104",
  //     duration: "6:12",
  //   },
  //   {
  //     id: 5,
  //     title: "Highlights Reel",
  //     thumbnail: "/api/placeholder/170/104",
  //     duration: "9:33",
  //   },
  //   {
  //     id: 6,
  //     title: "Stream Recap",
  //     thumbnail: "/api/placeholder/170/104",
  //     duration: "22:18",
  //   },
  //   {
  //     id: 7,
  //     title: "Challenge Run",
  //     thumbnail: "/api/placeholder/170/104",
  //     duration: "18:45",
  //   },
  // ];
  const videos = [
    { id: "2512086416", title: "Twitch VOD 1" },
    { id: "2511803222", title: "Twitch VOD 2" },
    { id: "2511903812", title: "Twitch VOD 3" },
    { id: "2512054690", title: "Twitch VOD 4" },
    { id: "2513054690", title: "Twitch VOD 5" },
    { id: "2514054690", title: "Twitch VOD 6" },
    { id: "2515054690", title: "Twitch VOD 7" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Number of videos to show at once
  const videosPerView = 4;

  // Calculate max index to prevent going beyond available videos
  const maxIndex = Math.max(0, videos.length - videosPerView);

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleVideoClick = (video: any) => {
    console.log("Playing video:", video.title);
    // Add your video play logic here
  };

  // Get visible videos based on current index
  const visibleVideos = videos.slice(
    currentIndex,
    currentIndex + videosPerView
  );

  return (
    <div className="flex flex-col justify-center gap-1">
      <div className="text-center">
        <h1 className="text-xl font-bold text-white">Based on your data</h1>
        <h2 className="text-gray-400">We recommend these VODs</h2>
      </div>

      <section className="h-2/3 w-full rounded-lg p-4">
        <div className="flex items-center justify-center gap-2 h-full">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0 || isTransitioning}
            className={`h-[104px] rounded-l-md  border-l border-y border-gray-600 w-[23px] flex items-center justify-center transition-all duration-200 ${
              currentIndex === 0
                ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-600 hover:border-gray-500"
            } ${isTransitioning ? "opacity-50" : ""}`}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Video Items */}
          <div className="flex gap-2 h-full items-center">
            {visibleVideos.map((video, index) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className={`h-[104px] rounded-md border border-gray-600 w-[170px] bg-gray-800 cursor-pointer transition-all duration-300 hover:border-gray-400 hover:bg-gray-700 relative overflow-hidden group ${
                  isTransitioning ? "opacity-75" : ""
                }`}
              >
                {/* Thumbnail Background */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-50"
                  // style={{
                  //   backgroundImage: `url(${video.thumbnail})`,
                  //   backgroundSize: "cover",
                  //   backgroundPosition: "center",
                  // }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white bg-opacity-90 rounded-full p-2">
                    <Play size={16} className="text-black ml-0.5" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <div className="text-white text-xs font-medium truncate">
                    {video.title}
                  </div>
                  {/* <div className="text-gray-300 text-xs">{video.duration}</div> */}
                </div>
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={currentIndex >= maxIndex || isTransitioning}
            className={`h-[104px] rounded-r-md  border-r border-y border-gray-600 w-[23px] flex items-center justify-center transition-all duration-200 ${
              currentIndex >= maxIndex
                ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-600 hover:border-gray-500"
            } ${isTransitioning ? "opacity-50" : ""}`}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Indicators */}
        {/* <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(i);
                  setTimeout(() => setIsTransitioning(false), 300);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "bg-white"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div> */}
      </section>
    </div>
  );
};

export default VideoCarousel;
