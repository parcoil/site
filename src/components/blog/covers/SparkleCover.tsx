export default function SparkleCover() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0a0a0a] border-[#282828] border-2 h-full flex items-center justify-center">
      <div className="relative z-10 flex   items-center justify-center p-8 text-center gap-4 text-white ">
        <img
          src="/sparklelogo.png"
          alt="Sparkle"
          className="text-5xl mb-2 w-20 h-20"
        />
        <h2 className="text-2xl font-bold">Sparkle</h2>
        {/* <p className="text-white/80">Windows debloat utility</p> */}
      </div>{" "}
    </div>
  );
}
