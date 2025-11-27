// Currently Sidebar handles most navigation, but Navbar can be used for mobile or page titles.
// For this design, we might not need a top navbar if the sidebar is sufficient, 
// but let's create a simple header wrapper for the main content area.

const Navbar = ({ title, subtitle }) => {
    return (
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-1">{title}</h1>
            {subtitle && <p className="text-slate-500">{subtitle}</p>}
        </header>
    );
};

export default Navbar;
