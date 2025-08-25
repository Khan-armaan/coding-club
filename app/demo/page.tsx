// app/demo/page.tsx
import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Real-time Counter Demo
        </h1>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Choose Your Implementation:</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🔌 WebSocket Version
              </Link>
              
              <Link 
                href="/sse" 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                📡 Server-Sent Events (SSE)
              </Link>
            </div>
            
            <div className="mt-8 text-left space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">WebSocket (Socket.IO)</h3>
                <p className="text-blue-600 text-sm">
                  ✅ Bidirectional communication<br/>
                  ✅ Better for complex real-time apps<br/>
                  ✅ Automatic reconnection<br/>
                  ❌ More complex setup
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Server-Sent Events (SSE)</h3>
                <p className="text-green-600 text-sm">
                  ✅ Simpler implementation<br/>
                  ✅ Built into browsers<br/>
                  ✅ Perfect for one-way data streaming<br/>
                  ✅ Automatic reconnection<br/>
                  ❌ One-way communication only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
