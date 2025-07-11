export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Elite Deals Hub
            <span className="text-urgency-red animate-pulse ml-2">🔥</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Exclusive affiliate offers handpicked for maximum value. 
            <span className="font-semibold text-action-orange"> Limited time deals</span> 
            that won't last long!
          </p>
          
          {/* Urgency Banner */}
          <div className="mt-4 inline-flex items-center bg-urgency-red text-white px-6 py-2 rounded-full text-sm font-medium animate-pulse">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Live: {Math.floor(Math.random() * 300) + 200} people viewing these deals</span>
          </div>
        </div>
      </div>
    </header>
  );
}
