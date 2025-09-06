import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout";
import SignIn from "./signin";
import SignUp from "./signup";
import RestClient from "./rest";
import History from "./history";
import Variables from "./variables";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
      { path: "rest", element: <RestClient /> },
      { path: "history", element: <History /> },
      { path: "variables", element: <Variables /> },
    ],
  },
]);
