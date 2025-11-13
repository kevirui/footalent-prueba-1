import Image from "next/image";
import Link from "next/link";
import UserList from "../components/UserList";// importar el nuevo componente

export default function Home() {
  return (
    <section className="h-[100vh]">
      <div className="flex items-center justify-center flex-col  h-full">
        <h1 id="heading" className="heading  text-4xl  font-bold mb-5">
          welcome to next.js!
        </h1>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-[var(--color-primary)] text-[var(--color-surface)] inline-block  px-5 py-1 text-xl font-medium rounded-2xl"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="bg-[var(--color-primary)] text-[var(--color-surface)] inline-block  px-5 py-1 text-xl font-medium rounded-2xl"
          >
            Register
          </Link>

       
          
        </div>
        <UserList />{/* usar el nuevo componente aquí  */}
    

          <Link
            href="/products"
            className="bg-green-600 text-white inline-block px-5 py-2 text-lg font-medium rounded-2xl hover:bg-green-700 transition-colors"
          >
            Ver Productos
          </Link>  </div>
    </section>
  );
}
