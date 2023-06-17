import { getServerSession } from 'next-auth';
import Sidebar from './Sidebar';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Navbar from './Navbar';
import { BottomMenu } from './BottomMenu';

export default async function RootLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <div className="h-screen flex flex-col bg-violet-100">
      {session && <Navbar />}
      {session && <Sidebar />}
      {session && <BottomMenu />}
      {session ? (
        <div className="transition-[margin] duration-500 overflow-y-auto ml-0 md:ml-[240px]">
          <div className="flex justify-center">
            <div className="w-full h-full lg:w-[650px] xl:w-[800px] transition-all duration-500 md:px-4 md:pt-8">
              {children}
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
