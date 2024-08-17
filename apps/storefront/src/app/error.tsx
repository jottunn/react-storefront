"use client";
export default function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="container">
      <p className="bg-red-100 p-1 text-sm">{error.message}</p>
    </div>
  );
}
