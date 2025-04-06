"use client";

import { useState, useEffect, useRef } from "react";

// Interface for YouTube Player
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: any;
      loaded: number;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoBannerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  aspectRatio?: string;
  muted?: boolean;
  maxHeight?: string;
  transitionDuration?: number;
  useApi?: boolean; // Whether to use API instead of iframe for YouTube/Vimeo
  loadingDelay?: number; // Additional delay before showing video
  objectFit?: "fill" | "contain" | "cover"; // Control how the video fits inside container
}

// Extract YouTube video ID from URL
const getYouTubeId = (url: string): string | null => {
  const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?v%3D)([\w-]{11}).*/;
  const youtubeMatch = url.match(youtubeRegex);
  return youtubeMatch && youtubeMatch[2].length === 11 ? youtubeMatch[2] : null;
};

// Extract Vimeo video ID from URL
const getVimeoId = (url: string): string | null => {
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  return vimeoMatch && vimeoMatch[1] ? vimeoMatch[1] : null;
};

// Get embed URL for iframe fallback
const getEmbedUrl = (videoUrl: string, objectFit: string): string | null => {
  const youtubeId = getYouTubeId(videoUrl);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&controls=0&rel=0&showinfo=0&mute=1&enablejsapi=1`;
  }

  const vimeoId = getVimeoId(videoUrl);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&background=1&muted=1`;
  }

  return null;
};

// Flag to track if YouTube API is already loading or loaded
let youtubeApiLoading = false;

// Load YouTube API script
const loadYouTubeApi = (): Promise<void> => {
  return new Promise((resolve) => {
    // If already loaded
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // If already loading
    if (youtubeApiLoading) {
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          resolve();
        }
      }, 100);
      return;
    }

    // Add preconnect hints for faster loading
    const addPreconnect = (url: string) => {
      if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = url;
        document.head.appendChild(link);
      }
    };

    addPreconnect("https://www.youtube.com");
    addPreconnect("https://www.youtube-nocookie.com");
    addPreconnect("https://i.ytimg.com");

    // Start loading the API
    youtubeApiLoading = true;
    const script = document.createElement("script");
    script.id = "youtube-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };

    document.head.appendChild(script);
  });
};

// Start preloading the YouTube API early if we're in the browser
if (typeof window !== "undefined") {
  loadYouTubeApi().catch(console.error);
}

const VideoBanner: React.FC<VideoBannerProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  aspectRatio = "16/9",
  muted = true,
  maxHeight = "80vh",
  transitionDuration = 1000,
  useApi = true,
  loadingDelay = 500, // Additional delay to ensure video is ready
  objectFit = "cover", // Default to cover which will crop to fill container
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // Handle client-side only functionality
  useEffect(() => {
    setIsMounted(true);
    setLoadingStartTime(Date.now());
  }, []);

  // Determine video type
  const youtubeId = getYouTubeId(videoUrl);
  const vimeoId = getVimeoId(videoUrl);
  const isYoutube = !!youtubeId;
  const isVimeo = !!vimeoId;
  const isHostedVideo = !isYoutube && !isVimeo;

  // Handle YouTube API loading
  useEffect(() => {
    if (!isMounted || !isYoutube || !useApi) return;

    const setupYouTubePlayer = async () => {
      try {
        await loadYouTubeApi();
        setApiLoaded(true);
      } catch (error) {
        console.error("Failed to load YouTube API:", error);
      }
    };

    setupYouTubePlayer();
  }, [isMounted, isYoutube, useApi]);

  // Initialize YouTube player once API is loaded
  useEffect(() => {
    if (!apiLoaded || !isYoutube || !playerContainerRef.current || !youtubeId) return;

    try {
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          loop: 1,
          controls: 0,
          showinfo: 0,
          mute: 1,
          playsinline: 1,
          rel: 0,
          playlist: youtubeId, // Required for looping
          start: 0,
          suggestedQuality: "hd1080", // Try for highest quality
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();

            // Set high quality if available
            try {
              event.target.setPlaybackQuality("hd1080");
            } catch (e) {
              console.warn("Could not set playback quality", e);
            }

            // Calculate minimum loading time
            const elapsedTime = Date.now() - loadingStartTime;
            const minimumLoadTime = loadingDelay;
            const remainingDelay = Math.max(0, minimumLoadTime - elapsedTime);

            // Ensure minimum delay for smoother appearance
            setTimeout(() => {
              setIsLoaded(true);
            }, remainingDelay);
          },
          onStateChange: (event: any) => {
            // Video is playing
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsLoaded(true);
            }
          },
          onError: (error: any) => {
            console.error("YouTube player error:", error);
          },
        },
      });
    } catch (error) {
      console.error("Error initializing YouTube player:", error);
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [apiLoaded, isYoutube, youtubeId, loadingStartTime, loadingDelay]);

  // Apply custom styling to YouTube player to fix aspect ratio issues
  useEffect(() => {
    if (!isLoaded || !isYoutube || !playerRef.current) return;

    // Function to adjust the player iframe for proper aspect ratio
    const adjustYouTubePlayer = () => {
      try {
        const iframe = playerRef.current.getIframe();
        if (iframe) {
          // For YouTube, we need to style the iframe based on objectFit
          if (objectFit === "cover") {
            // Cover: Scale video up to cover the entire container, may crop parts
            const containerWidth = playerContainerRef.current?.clientWidth || iframe.clientWidth;
            const containerHeight = playerContainerRef.current?.clientHeight || iframe.clientHeight;

            // Calculate the scaling required to cover the container
            const videoRatio = 16 / 9; // YouTube's native ratio
            const containerRatio = containerWidth / containerHeight;

            if (containerRatio > videoRatio) {
              // Container is wider than video
              const scale = containerWidth / (containerHeight * videoRatio);
              iframe.style.transform = `scale(${scale})`;
              iframe.style.transformOrigin = "center center";
            } else {
              // Container is taller than video
              const scale = (containerWidth * (1 / videoRatio)) / containerHeight;
              iframe.style.transform = `scale(${1 / scale})`;
              iframe.style.transformOrigin = "center center";
            }
          } else if (objectFit === "contain") {
            // Contain: Show the entire video, may have black bars
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.transform = "none";
          } else {
            // Fill: Stretch to fill container
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.transform = "none";
          }
        }
      } catch (error) {
        console.error("Error styling YouTube player:", error);
      }
    };

    // Adjust immediately and on resize
    adjustYouTubePlayer();
    window.addEventListener("resize", adjustYouTubePlayer);

    return () => {
      window.removeEventListener("resize", adjustYouTubePlayer);
    };
  }, [isLoaded, isYoutube, objectFit]);

  // Handle smooth transition after video loaded
  useEffect(() => {
    if (isMounted && isLoaded) {
      // Slight delay to ensure everything is ready
      setTimeout(() => {
        setFadeIn(true);
      }, 100);
    }
  }, [isMounted, isLoaded]);

  // Get the appropriate video source for hosted videos
  let videoSource = videoUrl;

  // Get thumbnail URL with YouTube high-quality fallback
  const thumbnailSource = thumbnailUrl
    ? thumbnailUrl
    : isYoutube && youtubeId
      ? `https://i.ytimg.com/vi_webp/${youtubeId}/maxresdefault.webp` // WebP for better performance
      : "/images/default-video-thumbnail.jpg";

  // Handle video loaded
  const handleVideoLoaded = () => {
    // Calculate minimum loading time
    const elapsedTime = Date.now() - loadingStartTime;
    const minimumLoadTime = loadingDelay;
    const remainingDelay = Math.max(0, minimumLoadTime - elapsedTime);

    // Ensure minimum delay for smoother appearance
    setTimeout(() => {
      setIsLoaded(true);
    }, remainingDelay);
  };

  // Handle iframe loaded (for embedded videos)
  const handleIframeLoaded = () => {
    // Calculate minimum loading time
    const elapsedTime = Date.now() - loadingStartTime;
    const minimumLoadTime = loadingDelay;
    const remainingDelay = Math.max(0, minimumLoadTime - elapsedTime);

    // Ensure minimum delay for smoother appearance
    setTimeout(() => {
      setIsLoaded(true);
    }, remainingDelay);
  };

  // Create style object
  const containerStyle: React.CSSProperties = {
    maxHeight,
    height: aspectRatio ? "auto" : maxHeight,
  };

  // Add aspectRatio if provided
  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio;
  }

  // Video container styles for object-fit
  const videoContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
  };

  // YouTube player container styles
  const youtubeContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
  };

  // Transition styles
  const transitionStyle: React.CSSProperties = {
    transition: `opacity ${transitionDuration / 1000}s ease-in-out`,
    opacity: fadeIn ? 1 : 0,
  };

  // Determine which video player to render
  const renderVideoPlayer = () => {
    if (isYoutube && useApi) {
      return (
        <div ref={playerContainerRef} className="w-full h-full" style={youtubeContainerStyle} />
      );
    } else if (isHostedVideo) {
      return (
        <video
          ref={videoRef}
          src={videoSource}
          className="w-full h-full"
          style={{ objectFit }}
          autoPlay
          loop
          playsInline
          muted={muted}
          controls={false}
          onLoadedData={handleVideoLoaded}
          preload="auto"
        >
          <source src={videoSource} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      // Fallback to iframe for YouTube/Vimeo when API not used
      const embedUrl = getEmbedUrl(videoUrl, objectFit);
      return embedUrl ? (
        <div className="w-full h-full" style={videoContainerStyle}>
          <iframe
            src={embedUrl}
            title={title || "Video"}
            className="w-full h-full absolute inset-0"
            style={{
              border: "none",
              width: objectFit === "cover" ? "300%" : "100%", // Oversize for cover
              height: objectFit === "cover" ? "300%" : "100%", // Oversize for cover
              left: objectFit === "cover" ? "-100%" : "0", // Center the oversized iframe
              top: objectFit === "cover" ? "-100%" : "0", // Center the oversized iframe
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoaded}
          />
        </div>
      ) : null;
    }
  };

  return (
    <div
      className="video-banner relative w-full max-w-[1920px] mx-auto overflow-hidden"
      style={containerStyle}
    >
      {/* Thumbnail Banner */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center z-10"
        style={{
          backgroundImage: `url(${thumbnailSource})`,
          transition: `opacity ${transitionDuration / 1000}s ease-in-out`,
          opacity: fadeIn ? 0 : 1,
        }}
      >
        {/* {title && (
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3"
                        style={{
                            transition: `opacity ${transitionDuration / 1000}s ease-in-out`,
                            opacity: fadeIn ? 0 : 1
                        }}
                    >
                        <h3 className="text-lg font-medium">{title}</h3>
                    </div>
                )} */}
      </div>

      {/* Video Layer */}
      <div className="absolute inset-0 w-full h-full z-0" style={transitionStyle}>
        {isMounted && renderVideoPlayer()}

        {/* {title && (isHostedVideo || (isYoutube && useApi)) && (
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 z-10"
                        style={transitionStyle}
                    >
                        <h3 className="text-lg font-medium">{title}</h3>
                    </div>
                )} */}
      </div>
    </div>
  );
};

export default VideoBanner;
