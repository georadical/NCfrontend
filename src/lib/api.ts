import axios from "axios";
import type { paths } from "../types/api";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/cms/",
  withCredentials: false,
});

export type ApiPaths = paths;
