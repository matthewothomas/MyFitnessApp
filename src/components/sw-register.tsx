"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => console.log("Scope is: ", registration.scope))
                .catch((err) => console.log("Service Worker registration failed: ", err));
        }
    }, []);

    return null;
}
