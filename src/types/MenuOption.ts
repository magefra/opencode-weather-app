export interface MenuOption {
  key: string;
  label: string;
  /** Devuelve false cuando la aplicación debe salir del menú. */
  run: () => Promise<boolean>;
}
