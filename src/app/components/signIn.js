"use client";
import Button from "@mui/material/Button";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <Button onClick={() => signIn("GitHub")} variant="contained">
      Sign In
    </Button>
  );
}
