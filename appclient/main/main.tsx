import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./global.css";
import { router } from "./router";

const root = createRoot(document.getElementById("root")!);
root.render(<RouterProvider router={router} />);
