import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollFrameSectionProps {
  /** Folder where the image frames are stored in public/ */
  framesFolder: string;
  /** Total number of images in the sequence */
  frameCount: number;
  /** Total height of the scroll container, determining scroll speed/duration (e.g., '250vh', '300vh') */
  sectionHeight?: string;
  /** Whether to pin the canvas during the scrub animation */
  pinSection?: boolean;
  /** React elements or custom overlays to render above the canvas */
  overlayContent?: React.ReactNode;
  /** GSAP ScrollTrigger start setting (e.g., 'top top') */
  startTrigger?: string;
  /** GSAP ScrollTrigger end setting (e.g., 'bottom bottom') */
  endTrigger?: string;
  /** Image fit behavior inside canvas: 'cover' | 'contain' */
  objectFit?: 'cover' | 'contain';
  /** GSAP scrubbing speed (e.g., 0.5, 1, or true for direct sync) */
  scrubSpeed?: number | boolean;
  /** Custom canvas resolution multiplier for Retina/High-DPI displays */
  canvasResolution?: number;
}

export default function ScrollFrameSection({
  framesFolder,
  frameCount,
  sectionHeight = '250vh',
  pinSection = true,
  overlayContent,
  startTrigger = 'top top',
  endTrigger = 'bottom bottom',
  objectFit = 'cover',
  scrubSpeed = 0.5,
  canvasResolution,
}: ScrollFrameSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const scrollObjRef = useRef({ frame: 0 });

  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Preload all frames on mount or whenever frames parameters change
  useEffect(() => {
    let isMounted = true;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    let failedCount = 0;

    const onLoad = () => {
      if (!isMounted) return;
      loadedCount++;
      const currentProgress = Math.round(((loadedCount + failedCount) / frameCount) * 100);
      setProgress(currentProgress);

      if (loadedCount + failedCount === frameCount) {
        if (loadedCount === 0) {
          setError('Failed to load any frames in sequence.');
        } else {
          imagesRef.current = images;
          setLoaded(true);
        }
      }
    };

    const onError = (index: number) => {
      console.warn(`Failed to preload frame at index ${index} under folder ${framesFolder}`);
      failedCount++;
      onLoad(); // keep progressing to avoid locking the UI completely
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      // Constructs: path/ezgif-frame-001.png
      img.src = `${framesFolder}/ezgif-frame-${String(i + 1).padStart(3, '0')}.png`;
      img.onload = onLoad;
      img.onerror = () => onError(i);
      images.push(img);
    }

    return () => {
      isMounted = false;
    };
  }, [framesFolder, frameCount]);

  // Setup GSAP ScrollTrigger scrubbing animation
  useEffect(() => {
    if (!loaded || !canvasRef.current || !containerRef.current || imagesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scrollObj = scrollObjRef.current;
    scrollObj.frame = 0;

    // Core function to draw a specific frame based on resolution & scaling
    const drawFrame = (frameIndex: number) => {
      const img = imagesRef.current[frameIndex];
      if (!img) return;

      const parent = pinnedRef.current;
      const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();
      const dpr = canvasResolution || window.devicePixelRatio || 1;

      // Set actual pixel dimensions for the canvas to ensure crisp graphics
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasAspect = canvasWidth / canvasHeight;
      const imageAspect = img.width / img.height;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let drawX = 0;
      let drawY = 0;

      if (objectFit === 'cover') {
        if (imageAspect > canvasAspect) {
          drawWidth = canvasHeight * imageAspect;
          drawX = (canvasWidth - drawWidth) / 2;
        } else {
          drawHeight = canvasWidth / imageAspect;
          drawY = (canvasHeight - drawHeight) / 2;
        }
      } else {
        // Contain
        if (imageAspect > canvasAspect) {
          drawHeight = canvasWidth / imageAspect;
          drawY = (canvasHeight - drawHeight) / 2;
        } else {
          drawWidth = canvasHeight * imageAspect;
          drawX = (canvasWidth - drawWidth) / 2;
        }
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    // Render first frame immediately
    drawFrame(0);

    // Redraw on window resize
    const handleResize = () => {
      drawFrame(Math.round(scrollObj.frame));
    };
    window.addEventListener('resize', handleResize);

    // Create the scrubbing ScrollTrigger timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: startTrigger,
        end: endTrigger || `+=${sectionHeight}`,
        scrub: scrubSpeed,
        pin: pinSection ? pinnedRef.current : false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to(scrollObj, {
      frame: frameCount - 1,
      ease: 'none',
      onUpdate: () => {
        const index = Math.round(scrollObj.frame);
        drawFrame(index);
      },
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === containerRef.current) {
          trigger.kill();
        }
      });
    };
  }, [loaded, objectFit, startTrigger, endTrigger, sectionHeight, scrubSpeed, pinSection, frameCount, canvasResolution]);

  return (
    <div
      ref={containerRef}
      style={{ height: loaded ? sectionHeight : '100vh' }}
      className="relative w-full bg-[#030303] overflow-visible select-none"
    >
      {/* Pinned Viewport Container (Always Mounted to avoid conditional ref race-conditions) */}
      <div
        ref={pinnedRef}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-black"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block object-cover" />

        {/* Glowing Border Accents for Cinematic Tech Feel */}
        <div className="absolute inset-0 border border-zinc-900/30 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent pointer-events-none" />

        {loaded && overlayContent && (
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 lg:p-12">
            {overlayContent}
          </div>
        )}
      </div>

      {/* Cyberpunk Telemetry Loading HUD Overlay */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#030303] px-6"
          >
            <div className="w-full max-w-md p-8 rounded-xl border border-cyan-500/10 bg-zinc-950/80 backdrop-blur-md flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(6,182,212,0.03)] font-mono text-xs">
              <div className="flex items-center gap-3 text-cyan-400">
                <Activity className="w-5 h-5 animate-pulse" />
                <span className="font-bold tracking-widest uppercase">GRIEVANCEMAP // ENG_INGESTION</span>
              </div>

              {/* Progress ring/spinner */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#18181b"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#06b6d4"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={251.2}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white leading-none">{progress}%</span>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1">LOADED</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2 pt-2 border-t border-zinc-900">
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>TELEMETRY_BUFFERS:</span>
                  <span className="text-zinc-300">50_HIGH_DPI_ASSETS</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>CACHING_STATUS:</span>
                  <span className={error ? 'text-red-400' : 'text-cyan-400'}>
                    {error ? 'ERROR' : progress === 100 ? 'SUCCESS' : 'LOADING...'}
                  </span>
                </div>
                {error && (
                  <span className="text-[10px] text-red-500 text-center mt-2 border border-red-500/20 bg-red-950/15 p-2 rounded">
                    {error}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
