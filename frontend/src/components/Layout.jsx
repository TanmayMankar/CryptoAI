import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      {children}
    </div>
  );
}

export default Layout;
