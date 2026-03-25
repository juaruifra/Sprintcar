import { router } from "expo-router";
import { useEffect } from "react";
import InventarioScreen from "../../src/components/inventario/InventarioScreen";
import { useUserStore } from "../../src/store/userStore";

export default function InventarioTab() {

  // const { user } = useAuth();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    // Si no es administrador, lo sacamos de esta pantalla
    if (user?.roleId !== 2) {
      router.replace("/home");
    }
  }, [user]);

  // Mientras redirige, no mostramos nada
  if (user?.roleId !== 2) {
    return null;
  }

  return <InventarioScreen />;

}
