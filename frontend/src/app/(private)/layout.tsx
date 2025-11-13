//dato mockeado  import ClientGuard from "../guard/ClientGuard";
import Logout from "@/src/components/Logout";
import ClientGuard from "../guard/ClientGuard";
import Link from "next/link";


export const metadata = {
  title: "Dashboard",
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    //dato mockeado <ClientGuard>  
    <>
      <ClientGuard>

        {/* flexbox para crear el layout de Sidebar + Contenido */}
        <div className="flex min-h-screen">

          {/*Barra Lateral de Navegación */}
          <aside className="w-60 bg-gray-800 text-white p-6 flex flex-col">
            <h1 className="text-2xl font-bold mb-10"> Logo/App</h1>

            <nav className="flex-grow">
              <ul>
                <li className="mb-4">
                  <Link href="/dashboard" className="block p-2 rounded hover:bg-gray-700">
                    Dashboard
                  </Link>
                </li>

                {/* enlace a Productos */}
                {/*  Aquí está tu nuevo enlace a Productos */}
                <li className="mb-4">
                  <Link href="/products" className="block p-2 rounded hover:bg-gray-700">
                    Productos
                  </Link>
                </li>

                {/* se pueden agregar mas enlaces aca */}
              </ul>
            </nav>


            <div className="mt-auto">
              {/* Aca   botón de Logout */}
              {<Logout />}
              <p className="text-sm text-gray-400">Usuario: {/**/}</p>
            </div>
          </aside>

        {/* Contenido Principal de la Página */}
        <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
          {children} {/* Aquí se renderiza  `page.tsx` de Productos */}
        </main>
      </div>
      
    </ClientGuard>
   </>
   //dato mockeado </ClientGuard> 
  );
}
