const Loader = () => {
    return (
        <div className="flex-center min-h-[60vh] w-full">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-dark-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-light-200 text-sm">Loading event details...</p>
            </div>
        </div>
    );
};

export default Loader;

