export async function generateStaticParams() {
  // Return placeholder for static export - client-side handles actual order IDs
  return [{ id: "order" }];
}

// Layout component - just passes through to the page
export default function OrderDetailLayout({ children }) {
  return children;
}
