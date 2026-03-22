"use client";

import { useEffect } from "react";

export function DashboardFontActivator() {
    useEffect(() => {
        document.body.classList.add("dashboard-poppins-override");
        return () => {
            document.body.classList.remove("dashboard-poppins-override");
        };
    }, []);

    return null;
}
