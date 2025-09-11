import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";

const LANGUAGES = [
    {code: "en", label: "English"},
    {code: "pl", label: "Polski"},
];

export default function LanguageSwitcher() {
    const {i18n} = useTranslation();
    const [selected, setSelected] = useState(i18n.language || "en");

    useEffect(() => {
        const storedLang = localStorage.getItem("lang");
        if (storedLang && storedLang !== i18n.language) {
            i18n.changeLanguage(storedLang);
            setSelected(storedLang);
        }
    }, [i18n]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        localStorage.setItem("lang", newLang);
        setSelected(newLang);
    };

    return (
        <div className="language-switcher" >
            <select
                style={{
                    width: "80px",
                    height: "24px",
                    padding: 0
                }}
                value={selected}
                onChange={handleChange}
                className="rounded px-2 py-1 border border-gray-300 bg-white text-sm"
            >
                {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
