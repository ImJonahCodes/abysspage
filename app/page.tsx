import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Welcome to Admin Dashboard</h1>
        <div className="space-x-4">
          <Link 
            href="/admin" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}