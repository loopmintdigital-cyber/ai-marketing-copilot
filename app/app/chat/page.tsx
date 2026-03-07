export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <div className="inline-block bg-purple-600 text-white text-sm px-4 py-1 rounded-full mb-6">
          AI-Powered Marketing Engine
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Your AI Marketing<br />
          <span className="text-purple-400">Co-Pilot</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10">
          Replace your $10K/month agency. Get instant brand strategy, 
          copy, social posts, ads, SEO content and email sequences — 
          all trained on your product.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/onboarding" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg text-lg">
            Get Started Free
          </a>
        </div>
        <p className="text-gray-500 text-sm mt-6">
          Starting at $49/month · No agency needed
        </p>
      </div>
    </main>
  );
}