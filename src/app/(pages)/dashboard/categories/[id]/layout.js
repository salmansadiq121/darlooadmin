// For static export, return placeholder - actual category IDs handled client-side
export async function generateStaticParams() {
  // Return placeholder for static export - client-side handles actual category IDs
  return [{ id: "category" }];
}

// Layout component - just passes through to the page
export default function CategoryDetailLayout({ children }) {
  return children;
}
