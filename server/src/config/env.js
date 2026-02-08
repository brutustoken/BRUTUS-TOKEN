try {
    process.loadEnvFile();

} catch (error) {
    if (error.code === 'ENOENT') {
        console.warn('Aviso: No se encontró el archivo .env -> Usando variables por defecto.')
    } else {
        console.error('Error inesperado al cargar variables:', error)
    }
}

export const PORT = process.env.PORT ?? 8000