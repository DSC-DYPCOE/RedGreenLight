const StatsBar = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center text-center">
          <div>
            <div className="text-3xl font-bold text-pink-500">10K+</div>
            <div className="text-gray-300">Active Players</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-500">1M+</div>
            <div className="text-gray-300">Games Played</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-500">150+</div>
            <div className="text-gray-300">Countries</div>
          </div>
        </div>
      </div>
    </div>
  );
  
  export default StatsBar;
  