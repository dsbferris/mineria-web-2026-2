interface EstrellasProps {
  calificacion: number;
}

export default function Estrellas({ calificacion }: EstrellasProps) {
  const llenas = Math.round(calificacion);

  return (
    <span
      aria-label={`${calificacion} de 5 estrellas`}
      className="text-amber-500"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true">
          {i < llenas ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}
