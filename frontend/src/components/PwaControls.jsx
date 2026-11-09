import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PwaControls() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [ios, setIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installError, setInstallError] = useState("");
  const [installing, setInstalling] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    const standalone = window.matchMedia(
      "(display-mode: standalone)",
    );

    const syncInstalled = () => {
      setInstalled(
        standalone.matches || navigator.standalone === true,
      );
    };

    const handleInstallPrompt = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    syncInstalled();

    setIos(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (
        navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1
      ),
    );

    window.addEventListener(
      "beforeinstallprompt",
      handleInstallPrompt,
    );
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    standalone.addEventListener("change", syncInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      standalone.removeEventListener("change", syncInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;

    setInstalling(true);
    setInstallError("");

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } catch {
      setInstallError(
        "Não foi possível iniciar a instalação. Tente pelo menu do navegador.",
      );
    } finally {
      setInstalling(false);
    }
  };

  const update = async () => {
    try {
      await updateServiceWorker(true);
    } catch {
      setInstallError(
        "Não foi possível atualizar agora. Tente novamente com conexão.",
      );
    }
  };

  return (
    <>
      {offline && (
        <div
          role="status"
          className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900"
        >
          Você está sem conexão. Compras, mensagens e consultas
          precisam de internet.
        </div>
      )}

      {!installed && (installPrompt || ios) && (
        <div className="border-b bg-white px-4 py-3">
          <div className="container-dts flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Tenha o DTS na sua tela inicial.
            </p>

            {installPrompt ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={install}
                disabled={installing}
              >
                {installing ? "Abrindo..." : "Instalar aplicativo"}
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowIosHelp(current => !current)}
                aria-expanded={showIosHelp}
              >
                Como instalar
              </button>
            )}
          </div>

          {showIosHelp && (
            <p className="container-dts mt-3 text-sm text-slate-600">
              No Safari, toque em Compartilhar e depois em
              “Adicionar à Tela de Início”.
            </p>
          )}
        </div>
      )}

      {installError && (
        <p role="alert" className="px-4 py-3 text-sm text-red-700">
          {installError}
        </p>
      )}

      {(offlineReady || needRefresh) && (
        <section
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border bg-white p-5 shadow-xl sm:left-auto sm:w-96"
        >
          <h2 className="font-bold">
            {needRefresh
              ? "Nova versão disponível"
              : "Aplicativo pronto para abrir offline"}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {needRefresh
              ? "Conclua o que está fazendo antes de atualizar."
              : "As operações que consultam o sistema continuam precisando de internet."}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {needRefresh && (
              <button
                type="button"
                className="btn-primary"
                onClick={update}
              >
                Atualizar agora
              </button>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setOfflineReady(false);
                setNeedRefresh(false);
              }}
            >
              {needRefresh ? "Depois" : "Entendi"}
            </button>
          </div>
        </section>
      )}
    </>
  );
}