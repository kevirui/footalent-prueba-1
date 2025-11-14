"use client"
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
    totalPages: number;
}

/**
 * Componente de paginación para navegar entre páginas usando parámetros de búsqueda en la URL.
 * 
 * @param {number} totalPages - Número total de páginas disponibles para la paginación.
 * @returns {JSX.Element} - Renderiza dos botones: "Anterior" y "Siguiente" para cambiar de página.
 * 
 * Este componente utiliza los hooks `useRouter` y `useSearchParams` de Next.js
 * para actualizar la URL sin recargar la página y mantener la posición del scroll.
 */
export default function Pagination( {totalPages}: PaginationProps ) {
    const router = useRouter(); // Hook para navegar entre rutas del cliente
    const searchParams = useSearchParams(); // Hook para obtener los parámetros de la URL

    const currentPage = Number(searchParams.get('page') || 1);

    /**
     * Función que cambia la página actual actualizando el parámetro `page` en la URL.
     * 
     * @param {number} page - Número de página al que se desea ir.
     */

    const goToPage = (page: number) => {
        // Evita navegar a una página menor que 1 o mayor al total de páginas
        if (page < 1 || page > totalPages) return;

        // Crea una nueva instancia de URLSearchParams para modificar el parámetro `page`
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());

        // Actualiza la URL sin recargar la página y sin mover el scroll
        router.push(`?${params.toString()}`, { scroll: false });
    }

  return (
    <div className="flex gap-2">
        <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Anterior
        </button>
        <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Siguiente
        </button>
    </div>
  )
}
