export type Unidad = "C" | "F";

export interface Ciudad {
  id: number;
  nombre: string;
  pais: string;
  latitud: number;
  longitud: number;
}

export interface Configuracion {
  ciudades: Ciudad[];
  ciudadDefault: number | null;
  unidad: Unidad;
}
