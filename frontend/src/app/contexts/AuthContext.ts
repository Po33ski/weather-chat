"use client";
import React from "react";
import type { AuthContextType } from "@/app/types/types";

export const AuthContext = React.createContext<AuthContextType | null>(null);


