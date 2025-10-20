import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const languages = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "sw", name: "Kiswahili", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);

  useEffect(() => {
    // Set initial language from i18n
    const savedLanguage = localStorage.getItem("language") || "en";
    const language = languages.find((lang) => lang.code === savedLanguage) || languages[0];
    setCurrentLanguage(language);
    i18n.changeLanguage(language.code);
    document.documentElement.dir = language.dir;
    document.documentElement.lang = language.code;
  }, [i18n]);

  const changeLanguage = (code: string) => {
    const language = languages.find((lang) => lang.code === code) || languages[0];
    setCurrentLanguage(language);
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    document.documentElement.dir = language.dir;
    document.documentElement.lang = code;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Languages className="h-4 w-4 mr-2" />
          {currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={currentLanguage.code === language.code ? "bg-accent" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};