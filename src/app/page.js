"use client";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ReactTyped } from "react-typed";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { useRouter } from "next/navigation";

// JSON for games
const games = [
  { id: "game-1", name: "Game 1", image: "/Assets/game-1.png" },
  { id: "game-2", name: "Game 2", image: "/Assets/game-1.png" },
  { id: "game-3", name: "Game 3", image: "/Assets/game-1.png" },
  { id: "game-4", name: "Game 4", image: "/Assets/game-1.png" },
  { id: "game-5", name: "Game 5", image: "/Assets/game-1.png" }
];

const Home = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />

      {/* Platform Description Section */}
      <div className="flex justify-center items-center flex-grow">
        <div className="border-[4px] border-black bg-white pixel-corners p-6 w-[80%] text-center">
          <h1 className="text-3xl pixel-font">
            <ReactTyped
              strings={[
                "Win Arena is a play-to-earn one-stop with multiple games coming your way. Try unlimited times, best score counts, scale up the leaderboard, time-bound tournaments, and leaderboard-decided winners!"
              ]}
              typeSpeed={30}
              showCursor={true}
              cursorChar={"_"} // Cursor blinks at the end
            />
          </h1>
        </div>
      </div>

      {/* Outer Div with Border Around Marquee */}
      <div className="w-full flex justify-center py-6">
        <div className="relative border-[4px] border-black pixel-corners p-4 w-[90%] max-w-6xl overflow-hidden">
          
          {/* Infinite Scrolling Square Divs */}
          <Marquee gradient={false} speed={30} pauseOnHover={true} className="overflow-hidden">
            {games.map((game, index) => (
              <div
                key={index}
                className="relative w-60 h-60 border-[4px] border-black mx-6 pixel-corners bg-white cursor-pointer"
                onClick={() => router.push(`/${game.id}`)}
                onMouseDown={(e) => e.currentTarget.style.transform = "translate(4px, 4px)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "translate(0px, 0px)"}
              >
                {/* Pixelated Shadow (Behind the Button) */}
                <div className="absolute top-2 left-2 w-full h-full bg-black pixel-corners -z-10"></div>

                <Image
                  src={game.image}
                  alt={game.name}
                  width={240} // Adjust width
                  height={240} // Adjust height
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
