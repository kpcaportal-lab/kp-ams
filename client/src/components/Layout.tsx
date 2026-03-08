import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-transparent">
            <Sidebar />
            <main className="flex-1 overflow-y-auto scrollbar-thin flex flex-col relative z-0">
                <div className="min-h-full p-6 lg:p-10 animate-fade-in mx-auto w-full max-w-screen-2xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
