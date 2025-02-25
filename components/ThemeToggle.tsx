"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 right-4"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  )
}